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
            <div>
                <button type="button">
                    True
                </button>
                <button type="button">
                    False
                </button>
                <input type="number" id="multiplier" name="multiplier" min="1" max={gameState.totalDices} />
                x
                <select name="diceValue" id="diceValue">
                    <option value="ones">ones</option>
                    <option value="twos">twos</option>
                    <option value="threes">threes</option>
                    <option value="fours">fours</option>
                    <option value="fives">fives</option>
                    <option value="sixs">sixs</option>
                </select>
                <button type="button">
                    Bid
                </button>
            </div>
        </div>
    )
}

export default Game