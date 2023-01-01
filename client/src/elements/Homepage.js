import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import DicesSvg from '../assets/logo.svg';
import { nanoid } from 'nanoid';
import { InfoButton } from '../utils/infoBtn'

const Homepage = ({socket}) => {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');

    return (
        <div className='Homepage'>
            <h1>Dudo</h1>
            <div className='homepage-menu'>
                <img src={DicesSvg} width='200' style={{paddingTop: '5px'}} alt={'dices'}/> 
                <div className='homepage-form'>
                    <input type='text' placeholder='Player Name' onChange={(event) => setPlayerName(event.target.value)} />
                    <div className='homepage-create'>
                        <Link to={`/lobby?roomCode=${nanoid(10)}`} state={{playerName: playerName}}>
                            <button className="game-button green">CREATE NEW GAME</button>
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
            <InfoButton/>
        </div>
    )
}

export default Homepage