import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DicesSvg from '../assets/dices.svg';

const Homepage = () => {
    const [roomCode, setRoomCode] = useState('')

    return (
        <div className='Homepage'>
            <div className='homepage-menu'>
            <img src={DicesSvg} width='200' alt={'dices'}/> 
                {/* <DicesSvg /> */}
                <div className='homepage-form'>
                    <div className='homepage-create'>
                        <Link to={`/play?roomCode=TODOrandom}`}><button className="game-button green">CREATE GAME</button></Link>
                    </div>
                    <div className='homepage-join'>
                        <input type='text' placeholder='Game Code' onChange={(event) => setRoomCode(event.target.value)} />
                        <Link to={`/play?roomCode=${roomCode}`}><button className="game-button orange">JOIN GAME</button></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage