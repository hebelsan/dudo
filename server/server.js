const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

// const cors = require('cors');
// app.use(cors());

let users = []

const PORT = process.env.PORT || 5000

app.use(express.static(path.resolve(__dirname, '..', 'client', 'build')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

io.on('connection', (socket) => {
    console.log(`user:${socket.id} connected`);

    socket.on('join', (payload) => {
        const newUser = addUser({
            id: socket.id,
            name: '',
            room: payload.room
        });
        socket.join(newUser.room);
        io.to(newUser.room).emit('lobbyData', { user: newUser, users: getUsersInRoom(newUser.room) })
    })

    socket.on('disconnect', () => {
        console.log(`user id:${socket.id} disconnected`);
        const rmUser = removeUser(socket.id);
        io.to(rmUser.room).emit('lobbyData', { user: rmUser, users: getUsersInRoom(rmUser.room) })
    });
});

server.listen(PORT, () => {
  console.log('listening on *:5000');
});