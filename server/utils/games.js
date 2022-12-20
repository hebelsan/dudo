/*
games [
    game:
        players: [
            {id, name, dices}
        ]
        gameState:
            curPlayer: int (index)
            bet: {true, false, bet}
            lastBet: bet
            totalDices: int
        sendState
            turn: bool (is it your turn)
            dices: [1,2,3,4,5]
            totalDices: int
]
*/

const games = {};
const user2Room = {};

module.exports.gameExists = (roomId) => {
    return games[roomId] ? true : false;
};

module.exports.createGame = (roomId) => {
    games[roomId] = { players: [], state: {}};
};

module.exports.initGame = (roomId) => {
    // TODO randomize
    games[roomId].state.curPlayer = 0;
    games[roomId].state.totalDices = games[roomId].players.length * 5;
    newDices(roomId);

    return games[roomId].state;
};

/*
* Players functions
*/
module.exports.players = (roomId) => {
    return games[roomId].players;
}

module.exports.playerJoin = (roomId, playerId, playerName) => {
    games[roomId].players.push({id: playerId, name: playerName, numDices: 5})
    user2Room[playerId] = roomId;
};

module.exports.playerRemove = (playerId) => {
    const roomId = user2Room[playerId];
    const removeIndex = games[roomId].players.findIndex(player => player.id === playerId);

    if(removeIndex!==-1) {
        const rmPlayer = games[roomId].players.splice(removeIndex, 1)[0]
        return {roomId, rmPlayer};
    } else {
        process.exit('player to remove not found');
    }
}

const newDices = (roomId) => {
    games[roomId].players.forEach((player) => { 
        if (player.numDices > 0)
            player.dices = Array.from({length: player.numDices}, () => Math.trunc(Math.random()*6) + 1)
    });
}
