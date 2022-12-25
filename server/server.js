const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { gameExists, createGame, playerJoin, playerRemove, players, initGame, sendGameState, updateGame } = require('./utils/games')

// const cors = require('cors');
// app.use(cors());

const PORT = process.env.PORT_SOCKET || 5000

app.use(express.static(path.resolve(__dirname, '..', 'client', 'build')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

io.on('connection', (socket) => {
    console.log(`user:${socket.id} connected`);

    // LOBBY
    socket.on('join', (payload, setNameState) => {
        const playerRoom = payload.room;
        if (! gameExists(playerRoom)) createGame(playerRoom);
        const numPlayers = players(playerRoom).length + 1;
        const playerName = payload.name === '' ? `Player${numPlayers}` : payload.name;
        setNameState(playerName);
        playerJoin(playerRoom, socket.id, playerName)
        socket.join(playerRoom);
        io.to(playerRoom).emit('lobbyData', { users: players(playerRoom) })
    })
    socket.on('startGame', (room) => {
        initGame(room);
        sendGameState(room, io, 'lobbyFollowGame');
    })

    // GAME
    socket.on('updateGame', (state) => {
        const room = updateGame(socket.id, state);
        sendGameState(room, io);
    })

    // GENERAL
    socket.on('disconnect', () => {
        const {roomId ,rmPlayer} = playerRemove(socket.id);
        io.to(roomId).emit('lobbyData', { user: rmPlayer, users: players(roomId) })
    });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});