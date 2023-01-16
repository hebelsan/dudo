import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const Lobby = ({socket}) => {
    // get player name from homepage component state
    const location = useLocation();
    const [playerName, setPlayerName] = useState(location.state?.playerName || '');
    const [playerID, setPlayerID] = useState('');

    // get room code from url parameter
    const [searchParams] = useSearchParams();
    const roomCode = searchParams.get("roomCode");

    useEffect(() => {
        socket.emit('join', { room: roomCode, name: playerName }, (name, id) => {
            setPlayerName(name);
            setPlayerID(id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [players, setPlayers] = useState([]);

    useEffect(() => {
        socket.on('lobbyData', ({ players }) => {
            setPlayers(players)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleStartGame = () => {
        socket.emit('startGame', roomCode);
    };
    const navigate = useNavigate();
    useEffect(() => {
        socket.on('lobbyFollowGame', (gameState) => {
            navigate(`/game?roomCode=${roomCode}`, {state:{
                playerName: playerName,
                playerID: playerID,
                gameState: gameState, 
                roomCode: roomCode,
                players: players,
            }});
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerName, playerID, players])


    return (
        <div className='Lobby'>
            <h1>Lobby</h1>
            <button type="button" onClick={handleStartGame} value={socket} disabled={players.length<=1}>
                START GAME
            </button>
            {players.map((u) => <li key={u.id}>name: {u.name} id: {u.id}</li>)}
        </div>
    )
}

export default Lobby