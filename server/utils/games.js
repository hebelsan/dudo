/*
games [
    game:
        players: [
            {id, name, dices, numDices}
        ]
        state:
            curPlayer: int (index)
            lastBid: bid
            totalDices: int
            newDices: bool
        sendState
            turn: bool (is it your turn)
            dices: [1,2,3,4,5]
            totalDices: int
            curPlayer: string
            lastBid: bid
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
    games[roomId].state.totalDices = games[roomId].players.length * PLAYERS_DICES;
};

/*
* Game updates
*/
module.exports.updateGame = (playerId, state) => {
    const roomId = user2Room[playerId];
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
        const sendState = {
            turn: index == games[roomId].state.curPlayer,
            dices: player.dices,
            totalDices: games[roomId].state.totalDices,
            curPlayer: games[roomId].players[games[roomId].state.curPlayer].name,
            lastBid: games[roomId].state.lastBid
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

const nextPlayer = (roomId) => {
    const curPlayer = games[roomId].state.curPlayer;
    const numPlayers = games[roomId].players.length;
    if ((curPlayer + 1) < numPlayers)
        return curPlayer + 1;
    return 0;
}
const lastPlayer = (roomId) => {
    const curPlayer = games[roomId].state.curPlayer;
    const numPlayers = games[roomId].players.length;
    if ((curPlayer - 1) < 0)
        return numPlayers - 1;
    return curPlayer - 1;
}

/*
* helpers
*/

const newDices = (roomId) => {
    games[roomId].players.forEach((player) => { 
        if (player.numDices > 0)
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
    switch(roundState) {
        case ROUND_STATE.NEXT:
            games[roomId].state.lastBid = newBid;
            games[roomId].state.curPlayer = nextPlayer(roomId);
            break;
        case ROUND_STATE.CUR_PLAYER_LOSE:
            games[roomId].state.lastBid = undefined;
            games[roomId].players[games[roomId].state.curPlayer].numDices--;
            games[roomId].state.totalDices--;
            games[roomId].state.newDices = true;
            break;
        case ROUND_STATE.PLAYER_BEFORE_LOSE:
            const playerBefore = lastPlayer(roomId);
            games[roomId].state.lastBid = undefined;
            games[roomId].players[playerBefore].numDices--;
            games[roomId].state.totalDices--;
            games[roomId].state.newDices = true;
            games[roomId].state.curPlayer = playerBefore;
            break;
        case ROUND_STATE.WIN:
            games[roomId].state.lastBid = undefined;
            games[roomId].state.newDices = true;
            break;
        case ROUND_STATE.WIN_GAIN:
            games[roomId].state.lastBid = undefined;
            games[roomId].state.newDices = true;
            games[roomId].players[games[roomId].state.curPlayer].numDices++;
            games[roomId].state.totalDices++;
            break;
    }
}
