/*
games [
    game:
        players: [
            {id, name, dices}
        ]
        state:
            curPlayer: int (index)
            bid: (true, false, bid)
            lastBid: bid
            totalDices: int
        sendState
            turn: bool (is it your turn)
            dices: [1,2,3,4,5]
            totalDices: int
            curPlayer: string
            lastBid: bid, undefined
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
    // TODO randomize first player and players position
    games[roomId].state.curPlayer = 0;
    games[roomId].state.lastBid = undefined;
    games[roomId].state.totalDices = games[roomId].players.length * 5;
    newDices(roomId);
};

module.exports.sendGameState = (roomId, io, event='newGameState') => {
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
