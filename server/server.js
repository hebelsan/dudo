import path from 'path';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { GameState } from './lib/GameState.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// const cors = require('cors');
// app.use(cors());

const GAMES = {};
const PORT = process.env.PORT || 5000


app.use(express.static(path.resolve(__dirname, '..', 'client', 'build')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'))
})

io.on('connection', (socket) => {
    console.log(`user:${socket.id} connected`);

    // LOBBY
    socket.on('join', (payload, callback) => {
        const playerRoom = payload.room;
        let game;
        if (! GAMES[playerRoom]) {
            game = new GameState(playerRoom);
            GAMES[playerRoom] = game;
        } else {
            game = GAMES[playerRoom];
        }
        const playerNumber = game.numPlayers() + 1;
        const playerName = payload.name === '' ? `Player${playerNumber}` : payload.name;
        game.playerJoin(socket.id, playerName);
        socket.join(playerRoom);
        callback(playerName, socket.id);
        io.to(playerRoom).emit('lobbyData', { players: game.getPlayersJSON() })
    })
    socket.on('startGame', (roomID) => {
        const game = GAMES[roomID];
        game.newDices();
        game.sendGameState(io, 'lobbyFollowGame');
    })

    // GAME
    socket.on('updateGame', (data) => {
        const roomID = data.roomID;
        const game = GAMES[roomID];
        game.updateGame(data.input);
        game.sendGameState(io);
    })

    // GENERAL
    socket.on('disconnecting', () => {
        for (const room of socket.rooms) {
            if (GAMES[room] && GAMES[room].playerIsInGame(socket.id)) {
                const rmPlayer = GAMES[room].playerRemove(socket.id);
                io.to(room).emit('lobbyData', { user: rmPlayer, users: GAMES[room].numPlayers() })
            }
        }
        console.log(`user:${socket.id} diconnecting`);
    });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});