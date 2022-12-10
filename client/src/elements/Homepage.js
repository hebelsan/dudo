import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DicesSvg from '../assets/dices.svg';
import { v4 as uuidv4 } from 'uuid';

const Homepage = () => {
    const [roomCode, setRoomCode] = useState('')

    return (
        <div className='Homepage'>
            <div className='homepage-menu'>
            <img src={DicesSvg} width='200' alt={'dices'}/> 
                {/* <DicesSvg /> */}
                <div className='homepage-form'>
                    <div className='homepage-create'>
                        <Link to={`/lobby?roomCode=${uuidv4()}`}><button className="game-button green">CREATE GAME</button></Link>
                    </div>
                    <div className='homepage-join'>
                        <input type='text' placeholder='Game Code' onChange={(event) => setRoomCode(event.target.value)} />
                        <Link to={`/lobby?roomCode=${roomCode}`}><button className="game-button orange">JOIN GAME</button></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage