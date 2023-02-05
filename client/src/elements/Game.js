import React, { useEffect, useState } from 'react';
import {View} from 'react-native';
import { useLocation } from 'react-router-dom';
import * as bid from '../utils/bid';
import { getDiceImg } from '../components/diceImg';
import { Table } from '../components/Table';

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
    const playerID = location.state.playerID;
    const roomCode = location.state.roomCode;
    const players = location.state.players;
    const [inputMulitplier, setInputMulitplier] = useState(1);
    const [inputDice, setInputDice] = useState(2);

    const inputHeightAmount = 0.25;
    
    useEffect(() => {
        socket.on('newGameState', (newGameState) => {
            setGameState({...gameState, ...newGameState});
            setInputMulitplier(newGameState.lastBid?.times || 1);
            setInputDice(newGameState.lastBid?.dice || 2);
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
            !(!lastBid && inputDice === 1) && // not allowed to start with ones
            (inputMulitplier !== 0 && inputDice !== 0) &&
            (!lastBid || bid.isGreater(currBid, lastBid))
        );
    }

    const isPlayersTurn = () => {
        return gameState.curPlayer === playerID;
    }

    const playerHasWon = () => {
        return gameState.playerWon === playerID;
    }

    const playerHasLost = () => {
        return gameState.dices.length === 0;
    }

    const palyerName = (curPlayerID) => {
        return players.find(player => player.id === curPlayerID).name;
    }
    
    const renderPlayerInput = () => {
        if (isPlayersTurn() && !playerHasWon()) {
            return renderBidInput();
        } else {
            return <>{`it's ${palyerName(gameState.curPlayer)}'s turn`}</>
        }
    }

    const renderBidInput = () => {
        return (
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
        );
    }

    const renderActionBar = () => {
        if (playerHasLost()) {
            return <b>you lose!</b>
        } else if (playerHasWon()) {
            return  <b>you win!</b>
        } else {
            return (
                <View className="GameInfo" style={{width: '100%', height:'100%', position:'absolute', flex: 1}}>
                    <View style={{width: '100%', height: inputHeightAmount * 100 + '%'}}>
                        <div>last bid: {JSON.stringify(gameState.lastBid)}</div>
                        <div>{gameState.dices.map((dice, idx) => <img key={'dice' + idx} src={getDiceImg(dice)} width='50' alt={'dice' + idx}/>) }</div>
                        {renderPlayerInput()}
                    </View>
                    <View style={{flex: 1}}>
                        <Table players={players} state={gameState} heightAmount={1-inputHeightAmount} />
                    </View>
                </View>
            )
        }
    }

    return (
        renderActionBar()
    );
}

export default Game