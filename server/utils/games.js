/*
games [
    game:
        players: [
            {id, name}
        ]
        state:
            currenPlayer:
            currentBluff:
            lastBluff:
            numDices:
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

/*
* Players functions
*/
module.exports.players = (roomId) => {
    return games[roomId].players;
}

module.exports.playerJoin = (roomId, playerId, playerName) => {
    games[roomId].players.push({id: playerId, name: playerName})
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
