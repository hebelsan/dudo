const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// const cors = require('cors');
// app.use(cors());

const PORT = process.env.PORT || 5000

app.use(express.static(path.resolve(__dirname, '..', 'client', 'build')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

// app.get('/', (req, res) => {
//     res.sendFile(path.resolve(__dirname + '/../index.html'));
// });

io.on('connection', (socket) => {
    console.log(`user:${socket.id} connected`);
    
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log(`user:${socket.id} disconnected`);
    });
});

server.listen(PORT, () => {
  console.log('listening on *:3000');
});