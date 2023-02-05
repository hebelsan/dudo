import { Player } from "./Player.js";
import { ROUND_STATE, ROUND_TYPE } from "./enums.js";

export class GameState {
    #roomID;
    #maxPlayerDices;
    #totalDices;
    #players = [];
    #curPlayer = 0;
    #lastBid = undefined;
    #playerWon = undefined;
    #diceChange = undefined; // {playerID: '123', amount: -1}
    #roundType = ROUND_TYPE.NORMAl;

    constructor(roomID, maxPlayerDices=5) {
        this.#roomID = roomID;
        this.#maxPlayerDices = maxPlayerDices;
    }

    updateGame(input) {
        console.log(`updateGame room: ${this.#roomID}`);
        if (input.hasOwnProperty('bid')) {
            const roundState = this.#getRoundState(input.bid);
            this.#applyState(roundState, input.bid);
        } else if (input.hasOwnProperty('roundType')) {
            this.#roundType = input.roundType;
        }
    }

    sendGameState(io, event='newGameState') {
        this.#players.forEach((player, index) => {
            let sendState = {
                id: player.getID(),
                dices: player.dices,
                turn: index == this.#curPlayer,
                totalDices: this.#totalDices,
                curPlayer: this.#players[this.#curPlayer].getID(),
                lastBid: this.#lastBid,
                diceChange: this.#diceChange,
                playerWon: this.#playerWon?.getID(),
                startSpecialRound: false
            }
            if (this.#startSpecialRound()) {
                sendState.dices = this.#maskDices(player.dices);
                sendState.startSpecialRound = true;
            }
            if (this.#roundType == ROUND_TYPE.CLOSED) {
                sendState.dices = this.#maskDices(player.dices);
            }
            if (this.#roundType == ROUND_TYPE.OPEN) {
                sendState.dices = this.#maskDices(player.dices);
                sendState.othersDices = this.#players
                    .filter(p => p.getID() != sendState.id)
                    .map(p => ({ id: p.getID(), dices: p.dices }));
            }
            io.to(player.getID()).emit(event, sendState);
        });
        this.#diceChange = {};
    };
    
    playerJoin(playerID, playerName) {
        this.#players.push(new Player(playerID, playerName, this.#maxPlayerDices))
        this.#totalDices = this.#players.length * this.#maxPlayerDices;
    }

    playerIsInGame(playerID) {
        return this.#players.some(e => e.getID() === playerID)
    }

    playerRemove(playerID) {
        const removeIndex = this.#players.findIndex(player => player.getID() === playerID);
        if(removeIndex!==-1) {
            const rmPlayer = this.#players.splice(removeIndex, 1)[0]
            return JSON.stringify(rmPlayer);
        }
        console.error('player to remove not found');
    }

    numPlayers() {
        return this.#players.length;
    }
    
    // serialized
    getPlayersJSON() {
        return this.#players.map((player) => player.serialize())
    }

    newDices() {
        this.#players.forEach((player) => { 
            player.newDices();
        });
    }

    #nextPlayer(players, curPlayer, numPlayers, increment=0) {
        let n_player; // potentialNextBefore
        if (curPlayer >= numPlayers)
            n_player = 0;
        else if (curPlayer < 0)
            n_player = numPlayers - 1;
        else
            n_player = curPlayer;
        if (this.#isPlayerGameOver(n_player))
            return this.#nextPlayer(players, n_player+increment, numPlayers)
        return n_player;
    }
    #isPlayerGameOver(arrIdx) {
        return (this.#players[arrIdx].numDices) === 0;
    }
    #startSpecialRound() {
        return this.#players[this.#curPlayer].numDices === 1 && 
            this.#lastBid === undefined &&
            this.#roundType === ROUND_TYPE.NORMAl;
    }
    
    #playerRemoveDice(idx) {
        this.#players[idx].numDices--;
        this.#totalDices--;
        this.#setDiceChange(this.#players[idx].getID(), -1);
        if (this.#players[idx].numDices == 0) {
            const playersAlive = this.#players.filter((player) => player.numDices !== 0);
            if (playersAlive.length === 1) {
                this.#playerWon = playersAlive[0];
            }
        }
    }

    #getRoundState(newBid) {
        if ( typeof newBid === 'object' && newBid !== null)
            return ROUND_STATE.NEXT;
        const lastBid = this.#lastBid;
        const allDices = this.#players.map((player) => player.dices).flat();
        const numBidDices = allDices.filter(dice => lastBid.dice === dice || dice === 1).length;
        if (newBid === true) {
            const curTotalDices = this.#totalDices;
            const maxDices = this.#players.length * this.#maxPlayerDices;
            if (numBidDices === lastBid.times && curTotalDices >= maxDices/2 && curTotalDices !== maxDices)
                return ROUND_STATE.WIN_GAIN;
            if (numBidDices === lastBid.times)
                return ROUND_STATE.WIN;
            else
                return ROUND_STATE.CUR_PLAYER_LOSE;
        } else if (newBid === false) {
            if (numBidDices >= lastBid.times)
                return ROUND_STATE.CUR_PLAYER_LOSE;
            else
                return ROUND_STATE.PLAYER_BEFORE_LOSE;
        } else
            console.error("something is wrong with the bid...");
    }

    #applyState(roundState, newBid) {;
        const curPlayer = this.#curPlayer;
        const numPlayers = this.#players.length;
        switch(roundState) {
            case ROUND_STATE.NEXT:
                this.#lastBid = newBid;
                this.#curPlayer = this.#nextPlayer(this.#players, curPlayer+1, numPlayers, 1);
                break;
            case ROUND_STATE.CUR_PLAYER_LOSE:
                this.#playerRemoveDice(curPlayer);
                this.#curPlayer = this.#nextPlayer(this.#players, curPlayer, numPlayers, 1);
                this.#handleRoundFinish()
                break;
            case ROUND_STATE.PLAYER_BEFORE_LOSE:
                const playerBefore = this.#nextPlayer(this.#players, curPlayer-1, numPlayers, -1);
                this.#playerRemoveDice(playerBefore);
                if (!this.#isPlayerGameOver(playerBefore))
                    this.#curPlayer = playerBefore;
                this.#handleRoundFinish()
                break;
            case ROUND_STATE.WIN:
                this.#setDiceChange(this.#players[this.#curPlayer].getID(), 0);
                this.#handleRoundFinish()
                break;
            case ROUND_STATE.WIN_GAIN:
                this.#players[this.#curPlayer].numDices++;
                this.#setDiceChange(this.#players[this.#curPlayer].getID(), 1)
                this.#totalDices++;
                this.#handleRoundFinish()
                break;
        }
    }

    #handleRoundFinish() {
        this.#roundType = ROUND_TYPE.NORMAl;
        this.#lastBid = undefined;
        this.newDices();
    }

    #setDiceChange(id, amount) {
        this.#diceChange = { playerID: id, amount: amount }
    }

    #maskDices(dices) {
        return dices.map(() => 0);
    }
};