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

const PORT = process.env.PORT || 5000

app.use(express.static(path.resolve(__dirname, '..', 'client', 'build')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

io.on('connection', (socket) => {
    console.log(`user:${socket.id} connected`);

    // LOBBY
    socket.on('join', (payload, setNameState) => {
        const userRoom = payload.room;
        const userName = payload.name === '' ? `Player${getUsersInRoom(userRoom).length+1}` : payload.name;
        setNameState(userName);
        const newUser = addUser({
            id: socket.id,
            name: userName,
            room: userRoom
        });
        socket.join(userRoom);
        io.to(userRoom).emit('lobbyData', { user: newUser, users: getUsersInRoom(userRoom) })
    })
    socket.on('lobbyTriggerFollowGame', (room) => {
        io.to(room).emit('lobbyFollowGame')
    })

    // GENERAL
    socket.on('disconnect', () => {
        console.log(`user id:${socket.id} disconnected`);
        const rmUser = removeUser(socket.id);
        io.to(rmUser.room).emit('lobbyData', { user: rmUser, users: getUsersInRoom(rmUser.room) })
    });
});

server.listen(PORT, () => {
  console.log('listening on *:5000');
});