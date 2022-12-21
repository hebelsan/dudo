import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const Game = ({socket}) => {
    // get room code from url parameter
    const [searchParams, _] = useSearchParams();
    const roomCode = searchParams.get("roomCode");

    const location = useLocation();
    const [gameState, setGameState] = useState(location.state.gameState);
    const [playerName, setPlayerName] = useState(location.state.playerName);
    
    useEffect(() => {
        socket.on('newGameState', (newGameState) => {
            console.log(newGameState);
            setGameState({...gameState, ...newGameState});
        })
    }, [])

    return (
        <div className='Game'>
            <div>Total number of dices: {gameState.totalDices}</div>
            <div>Total number of dices: {gameState.curPlayer}</div>
            <div>your dices: {gameState.dices}</div>
            <div>your turn: {String(gameState.turn)}</div>
        </div>
    )
}

export default Game