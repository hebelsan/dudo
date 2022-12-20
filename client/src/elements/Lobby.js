import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const Lobby = ({socket}) => {
    // get player name from homepage component state
    const location = useLocation();
    const [playerName, setPlayerName] = useState(location.state?.playerName || '');

    // get room code from url parameter
    const [searchParams, _] = useSearchParams();
    const roomCode = searchParams.get("roomCode");

    useEffect(() => {
        socket.emit('join', { room: roomCode, name: playerName }, (name) => setPlayerName(name));

        // TODO disconnect from room
        // cleanup on component unmount
        // return function cleanup() {
        //     socket.disconnect();
        //     socket.off();
        // }
    }, [])

    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on('lobbyData', ({ users }) => {
            setUsers(users)
        })
    }, [])

    const handleStartGame = () => {
        socket.emit('startGame', roomCode);
    };
    const navigate = useNavigate();
    useEffect(() => {
        socket.on('lobbyFollowGame', (gameState) => {
            navigate(`/game?roomCode=${roomCode}`, {state:{playerName:playerName, gameState:gameState}});
        })
    }, [])


    return (
        <div className='Lobby'>
            <button type="button" onClick={handleStartGame} value={socket}>
                START GAME
            </button>
            {users.map((u) => <li key={u.id}>name: {u.name} id: {u.id}</li>)}
        </div>
    )
}

export default Lobby