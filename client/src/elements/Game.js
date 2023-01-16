import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as bid from '../utils/bid';
import { getDiceImg } from '../utils/images';

/**
GameState:
    turn: bool (is it your turn)
    dices: [1,2,3,4,5]
    totalDices: int
    curPlayer: string
    lastBid: bid, undefined
*/

/**
 * bidExample = {times: 5, dice: 6}
 */

const Game = ({socket}) => {
    const location = useLocation();
    const [gameState, setGameState] = useState(location.state.gameState);
    const playerName = location.state.playerName;
    const playerID = location.state.playerID;
    const roomCode = location.state.roomCode;
    const players = location.state.players;
    const [inputMulitplier, setInputMulitplier] = useState(1);
    const [inputDice, setInputDice] = useState(1);
    
    useEffect(() => {
        socket.on('newGameState', (newGameState) => {
            setGameState({...gameState, ...newGameState});
            setInputMulitplier(newGameState.lastBid?.times || 1);
            setInputDice(newGameState.lastBid?.dice || 1);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleBidDecision = (decision) => {
        socket.emit('updateGame', {roomID: roomCode, bid: decision});
    };

    const isValidBid = () => {
        const currBid = {times: inputMulitplier, dice: inputDice}
        const lastBid = gameState.lastBid;
        return (
            (inputMulitplier !== 0 && inputDice !== 0) &&
            (!lastBid || bid.isGreater(currBid, lastBid))
        );
    }

    const isPlayersTurn = () => {
        return gameState.curPlayer === playerID;
    }

    const playerHasWon = () => {
        return gameState.won === playerID;
    }

    const playerHasLost = () => {
        return gameState.dices.length === 0;
    }

    const renderActionBar = () => {
        if (playerHasLost()) {
            return <b>you lose!</b>
        } else if (playerHasWon()) {
            return  <b>you win!</b>
        } else {
            return (
                <div className="GameInfo">
                    <div>Your Name: {playerName}</div>
                    <div>Total number of dices: {gameState.totalDices}</div>
                    <div>Current Player: {gameState.curPlayer}</div>
                    <div>your turn: {String(gameState.turn)}</div>
                    <div>last bid: {JSON.stringify(gameState.lastBid)}</div>
                    <div>{players.map((p) => p.name)}</div>

                    <div>your dices: {gameState.dices}</div>
                    <div>{gameState.dices.map((dice, idx) => <img key={'dice' + idx} src={getDiceImg(dice)} width='50' alt={'dice' + idx}/>) }</div>
        
                    <div className='playerInput' style={{visibility: isPlayersTurn() && !playerHasWon() ? 'visible' : 'hidden' }}>
                        <button type="button" disabled={!gameState.lastBid} onClick={() => handleBidDecision(true)}>
                            True
                        </button>
                        <button type="button" disabled={!gameState.lastBid} onClick={() => handleBidDecision(false)}>
                            False
                        </button>
                        <input type="number" id="multiplier" name="multiplier" min="1" max={gameState.totalDices} value={inputMulitplier} onChange={e => setInputMulitplier(parseInt(e.target.value))} />
                        <select name="diceValue" id="diceValue" onChange={e => setInputDice(parseInt(e.target.value))} value={inputDice}>
                            <option value="1">ones</option>
                            <option value="2">twos</option>
                            <option value="3">threes</option>
                            <option value="4">fours</option>
                            <option value="5">fives</option>
                            <option value="6">sixs</option>
                        </select>
                        <button type="button" disabled={!isValidBid()} onClick={() => handleBidDecision({times: inputMulitplier, dice: inputDice})}>
                            Bid
                        </button>
                    </div>
                </div>
            )
        }
    }

    return (
        renderActionBar()
    );
}

export default Game