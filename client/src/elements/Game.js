import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const Game = ({socket}) => {
    const location = useLocation();
    const [playerName, setPlayerName] = useState(location.state?.playerName || '');

    // get room code from url parameter
    const [searchParams, _] = useSearchParams();
    const roomCode = searchParams.get("roomCode");

    return (
        <div className='Game'>
            GAME
        </div>
    )
}

export default Game