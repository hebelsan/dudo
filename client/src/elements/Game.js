import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const Game = ({socket}) => {
    const location = useLocation();
    const [gameState, setGameState] = useState(location.state.gameState);
    const [playerName, setPlayerName] = useState(location.state.playerName);

    // get room code from url parameter
    const [searchParams, _] = useSearchParams();
    const roomCode = searchParams.get("roomCode");

    return (
        <div className='Game'>
            GAME
            {gameState.totalDices}
        </div>
    )
}

export default Game