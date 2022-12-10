import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const connectionOptions =  {
    "forceNew" : true,
    "reconnectionAttempts": "30", 
    "timeout" : 10000,                  
    "transports" : ["websocket"]
};
const ENDPOINT = 'http://localhost:5000';

const Lobby = () => {
    //initialize socket state
    const [searchParams, _] = useSearchParams();
    const roomCode = searchParams.get("roomCode");
    let socket;
    useEffect(() => {
        socket = io.connect(ENDPOINT, connectionOptions);
        socket.emit('join', {room: roomCode});

        //cleanup on component unmount
        return function cleanup() {
            socket.disconnect();
            socket.off();
        }
    }, [])

    const [users, setUsers] = useState([]);
    useEffect(() => {
        socket.on("lobbyData", ({ users }) => {
            console.log(users);
            setUsers(users)
        })
    }, [])


    return (
        <div className='Lobby'>
            {users.map((u) => <li>id: {u.id}</li>)}
        </div>
    )
}

export default Lobby