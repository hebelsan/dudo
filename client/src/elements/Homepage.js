import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DicesSvg from '../assets/dices.svg';
import { v4 as uuidv4 } from 'uuid';

const Homepage = () => {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');

    return (
        <div className='Homepage'>
            <div className='homepage-menu'>
            <img src={DicesSvg} width='200' alt={'dices'}/> 
                {/* <DicesSvg /> */}
                <div className='homepage-form'>
                    <input type='text' placeholder='Player Name' onChange={(event) => setPlayerName(event.target.value)} />
                    <div className='homepage-create'>
                        <Link to={`/lobby?roomCode=${uuidv4()}`} state={{playerName: playerName}}>
                            <button className="game-button green">CREATE GAME</button>
                        </Link>
                    </div>
                    <div className='homepage-join'>
                        <input type='text' placeholder='Game Code' onChange={(event) => setRoomCode(event.target.value)} />
                        <Link to={`/lobby?roomCode=${roomCode}`} state={{playerName: playerName}}>
                            <button className="game-button orange">JOIN GAME</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage