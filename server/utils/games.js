/*
games [
    game:
        players: [
            {id (string), name(string), dices(arr), numDices(int)}
        ]
        state:
            curPlayer: int (index)
            lastBid: bid
            totalDices: int
            newDices: bool
            won: undefined | string
        sendState
            turn: bool (is it your turn)
            dices: [1,2,3,4,5]
            totalDices: int
            curPlayer: string
            lastBid: bid
            won: string
]
*/

const games = {};
const user2Room = {};
const PLAYERS_DICES = 5;

/*
* Game creation
*/
module.exports.gameExists = (roomId) => {
    return games[roomId] ? true : false;
};

module.exports.createGame = (roomId) => {
    games[roomId] = { players: [], state: {}};
};

module.exports.initGame = (roomId) => {
    // TODO randomize first player and players position
    games[roomId].state.curPlayer = 0;
    games[roomId].state.newDices = true;
    games[roomId].state.lastBid = undefined;
    games[roomId].state.won = undefined;
    games[roomId].state.totalDices = games[roomId].players.length * PLAYERS_DICES;
};

/*
* Game updates
*/
module.exports.updateGame = (playerId, state) => {
    const roomId = user2Room[playerId];
    console.log(`updateGame room: ${roomId}`);
    if (state.hasOwnProperty('bid')) {
        const roundState = getRoundState(roomId, state.bid);
        applyRoundState(roomId, roundState, state.bid);
    }
    return roomId;
};

module.exports.sendGameState = (roomId, io, event='newGameState') => {
    if (games[roomId].state.newDices)
        newDices(roomId);
    games[roomId].players.forEach((player, index) => {
        let sendState = {
            dices: player.dices,
            turn: index == games[roomId].state.curPlayer,
            totalDices: games[roomId].state.totalDices,
            curPlayer: games[roomId].players[games[roomId].state.curPlayer].name,
            lastBid: games[roomId].state.lastBid,
            won: games[roomId].state.won
        }
        io.to(player.id).emit(event, sendState);
    });
};


/*
* Players functions
*/
module.exports.players = (roomId) => {
    return games[roomId].players;
}

module.exports.playerJoin = (roomId, playerId, playerName) => {
    games[roomId].players.push({id: playerId, name: playerName, numDices: PLAYERS_DICES})
    user2Room[playerId] = roomId;
};

module.exports.playerRemove = (playerId) => {
    const roomId = user2Room[playerId];
    const removeIndex = games[roomId].players.findIndex(player => player.id === playerId);

    if(removeIndex!==-1) {
        const rmPlayer = games[roomId].players.splice(removeIndex, 1)[0]
        return {roomId, rmPlayer};
    } else {
        console.error('player to remove not found');
    }
}

module.exports.playerIsInGame = (playerId) => {
    return user2Room[playerId]
}

const nextPlayer = (players, curPlayer, numPlayers, increment=0) => {
    let n_player; // potentialNextBefore
    if (curPlayer >= numPlayers)
        n_player = 0;
    else if (curPlayer < 0)
        n_player = numPlayers - 1;
    else
        n_player = curPlayer;
    if (isPlayerGameOver(players, n_player))
        return nextPlayer(players, n_player+increment, numPlayers)
    return n_player;
}
const isPlayerGameOver = (players, arrIdx) => {
    return (players[arrIdx].numDices) === 0;
}

const playerRemoveDice = (roomId, idx) => {
    games[roomId].players[idx].numDices--;
    games[roomId].state.totalDices--;
    if (games[roomId].players[idx].numDices == 0) {
        const playersAlive = games[roomId].players.filter((player) => player.numDices !== 0);
        if (playersAlive.length === 1) {
            games[roomId].state.won = playersAlive[0].name;
        }
    }
}

/*
* helpers
*/
const newDices = (roomId) => {
    games[roomId].players.forEach((player) => { 
        player.dices = Array.from({length: player.numDices}, () => Math.trunc(Math.random()*6) + 1)
    });
    games[roomId].state.newDices = false;
}

const ROUND_STATE = {
    NEXT: "next", // next player (lastBid = curBid + curPlayer update)
    CUR_PLAYER_LOSE: "cur_player_lose", // (lose a dice + start new round + lastBid = undefined)
    PLAYER_BEFORE_LOSE:"player_before_lose", // (the player before looses a dice but starts round ) 
    WIN: "win", // (it's your turn but you don't win a dice) 
    WIN_GAIN: "win_gain" // (it's your turn and you win a dice)
}
// returns ROUND_STATE
const getRoundState = (roomId, newBid) => {
    if ( typeof newBid === 'object' && newBid !== null)
        return ROUND_STATE.NEXT;
    console.log(games[roomId].state);
    const lastBid = games[roomId].state.lastBid;
    const allDices = games[roomId].players.map((player) => player.dices).flat();
    const numBidDices = allDices.filter(dice => lastBid.dice === dice || dice === 1).length;
    if (newBid === true) {
        const curTotalDices = games[roomId].state.totalDices;
        const maxDices = games[roomId].players.length * PLAYERS_DICES;
        if (numBidDices === lastBid.times && curTotalDices >= maxDices/2 && curTotalDices !== maxDices)
            return ROUND_STATE.WIN_GAIN;
        if (numBidDices === lastBid.times)
            return ROUND_STATE.WIN;
        else
            return ROUND_STATE.CUR_PLAYER_LOSE;
    } else if (newBid === false) {
        if (numBidDices >= lastBid.times)
            return ROUND_STATE.CUR_PLAYER_LOSE;
        else
            return ROUND_STATE.PLAYER_BEFORE_LOSE;
    } else
        console.error("something is wrong with the bid...");
}
const applyRoundState = (roomId, roundState, newBid) => {
    const curPlayer = games[roomId].state.curPlayer;
    const numPlayers = games[roomId].players.length;
    switch(roundState) {
        case ROUND_STATE.NEXT:
            games[roomId].state.lastBid = newBid;
            games[roomId].state.curPlayer = nextPlayer(games[roomId].players, curPlayer+1, numPlayers, 1);
            break;
        case ROUND_STATE.CUR_PLAYER_LOSE:
            playerRemoveDice(roomId, games[roomId].state.curPlayer);
            games[roomId].state.curPlayer = nextPlayer(games[roomId].players, curPlayer, numPlayers, 1);
            games[roomId].state.lastBid = undefined;
            games[roomId].state.newDices = true;
            break;
        case ROUND_STATE.PLAYER_BEFORE_LOSE:
            const playerBefore = nextPlayer(games[roomId].players, curPlayer-1, numPlayers, -1);
            playerRemoveDice(roomId, playerBefore);
            games[roomId].state.lastBid = undefined;
            games[roomId].state.newDices = true;
            if (!isPlayerGameOver(games[roomId].players, playerBefore))
                games[roomId].state.curPlayer = playerBefore;
            break;
        case ROUND_STATE.WIN:
            games[roomId].state.lastBid = undefined;
            games[roomId].state.newDices = true;
            break;
        case ROUND_STATE.WIN_GAIN:
            games[roomId].players[games[roomId].state.curPlayer].numDices++;
            games[roomId].state.lastBid = undefined;
            games[roomId].state.newDices = true;
            games[roomId].state.totalDices++;
            break;
    }
}
