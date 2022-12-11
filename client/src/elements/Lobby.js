import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const connectionOptions =  {
    "forceNew" : true,
    "reconnectionAttempts": "30", 
    "timeout" : 10000,                  
    "transports" : ["websocket"]
};
const ENDPOINT = 'http://localhost:5000';

const Lobby = () => {
    // get player name from homepage component state
    const location = useLocation();
    const playerName = location.state?.playerName || '';

    // get room code from url parameter
    const [searchParams, _] = useSearchParams();
    const roomCode = searchParams.get("roomCode");

    //initialize socket state
    let socket;

    useEffect(() => {
        socket = io.connect(ENDPOINT, connectionOptions);
        socket.emit('join', { room: roomCode, name: playerName });

        //cleanup on component unmount
        return function cleanup() {
            socket.disconnect();
            socket.off();
        }
    }, [])

    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on("lobbyData", ({ users }) => {
            setUsers(users)
        })
    }, [])


    return (
        <div className='Lobby'>
            {users.map((u) => <li key={u.id}>name: {u.name} id: {u.id}</li>)}
        </div>
    )
}

export default Lobby