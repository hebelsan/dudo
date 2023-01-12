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
    const game = games[roomId];
    // TODO randomize first player and players position
    game.state.curPlayer = 0;
    game.state.lastBid = undefined;
    game.state.won = undefined;
    game.state.totalDices = game.players.length * PLAYERS_DICES;
    newDices(game);
};

/*
* Game updates
*/
module.exports.updateGame = (playerId, state) => {
    const roomId = user2Room[playerId];
    console.log(`updateGame room: ${roomId}`);
    if (!roomId) {
        console.error(`can't find roomId to player: ${playerId}`)
        return;
    }
    const game = games[roomId];
    if (state.hasOwnProperty('bid')) {
        const roundState = getRoundState(game, state.bid);
        applyRoundState(game, roundState, state.bid);
    }
    return roomId;
};

module.exports.sendGameState = (roomId, io, event='newGameState') => {
    const game = games[roomId];
    if (!roomId || !game) {
        console.error(`can't find game to roomId: ${roomId}`);
        return;
    }
    game.players.forEach((player, index) => {
        let sendState = {
            dices: player.dices,
            turn: index == game.state.curPlayer,
            totalDices: game.state.totalDices,
            curPlayer: game.players[game.state.curPlayer].name,
            lastBid: game.state.lastBid,
            won: game.state.won
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

const playerRemoveDice = (game, idx) => {
    game.players[idx].numDices--;
    game.state.totalDices--;
    if (game.players[idx].numDices == 0) {
        const playersAlive = game.players.filter((player) => player.numDices !== 0);
        if (playersAlive.length === 1) {
            game.state.won = playersAlive[0].name;
        }
    }
}

/*
* helpers
*/
const newDices = (game) => {
    game.players.forEach((player) => { 
        player.dices = Array.from({length: player.numDices}, () => Math.trunc(Math.random()*6) + 1)
    });
}

const ROUND_STATE = {
    NEXT: "next", // next player (lastBid = curBid + curPlayer update)
    CUR_PLAYER_LOSE: "cur_player_lose", // (lose a dice + start new round + lastBid = undefined)
    PLAYER_BEFORE_LOSE:"player_before_lose", // (the player before looses a dice but starts round ) 
    WIN: "win", // (it's your turn but you don't win a dice) 
    WIN_GAIN: "win_gain" // (it's your turn and you win a dice)
}
// returns ROUND_STATE
const getRoundState = (game, newBid) => {
    if ( typeof newBid === 'object' && newBid !== null)
        return ROUND_STATE.NEXT;
    console.log(game.state);
    const lastBid = game.state.lastBid;
    const allDices = game.players.map((player) => player.dices).flat();
    const numBidDices = allDices.filter(dice => lastBid.dice === dice || dice === 1).length;
    if (newBid === true) {
        const curTotalDices = game.state.totalDices;
        const maxDices = game.players.length * PLAYERS_DICES;
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
const applyRoundState = (game, roundState, newBid) => {
    const curPlayer = game.state.curPlayer;
    const numPlayers = game.players.length;
    switch(roundState) {
        case ROUND_STATE.NEXT:
            game.state.lastBid = newBid;
            game.state.curPlayer = nextPlayer(game.players, curPlayer+1, numPlayers, 1);
            break;
        case ROUND_STATE.CUR_PLAYER_LOSE:
            playerRemoveDice(game, curPlayer);
            game.state.curPlayer = nextPlayer(game.players, curPlayer, numPlayers, 1);
            game.state.lastBid = undefined;
            newDices(game);
            break;
        case ROUND_STATE.PLAYER_BEFORE_LOSE:
            const playerBefore = nextPlayer(game.players, curPlayer-1, numPlayers, -1);
            playerRemoveDice(game, playerBefore);
            game.state.lastBid = undefined;
            newDices(game);
            if (!isPlayerGameOver(game.players, playerBefore))
            game.state.curPlayer = playerBefore;
            break;
        case ROUND_STATE.WIN:
            game.state.lastBid = undefined;
            newDices(game);
            break;
        case ROUND_STATE.WIN_GAIN:
            game.players[game.state.curPlayer].numDices++;
            game.state.lastBid = undefined;
            newDices(game);
            game.state.totalDices++;
            break;
    }
}
