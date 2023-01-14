import { Player } from "./Player.js";
import { ROUND_STATE } from "./roundState.js";

export class GameState {
    #roomID;
    #maxPlayerDices;
    #totalDices;
    #players = [];
    #curPlayer = 0;
    #lastBid = undefined;
    #playerWon = undefined;

    constructor(roomID, maxPlayerDices=5) {
        this.#roomID = roomID;
        this.#maxPlayerDices = maxPlayerDices;
    }

    updateGame(data) {
        console.log(`updateGame room: ${this.#roomID}`);
        if (data.hasOwnProperty('bid')) {
            const roundState = this.#getRoundState(data.bid);
            this.#applyRoundState(roundState, data.bid);
        }
    }

    sendGameState(io, event='newGameState') {
        this.#players.forEach((player, index) => {
            let sendState = {
                dices: player.dices,
                turn: index == this.#curPlayer,
                totalDices: this.#totalDices,
                curPlayer: this.#players[this.#curPlayer].getName(),
                lastBid: this.#lastBid,
                won: this.#playerWon?.getName()
            }
            io.to(player.getID()).emit(event, sendState);
        });
    };
    
    playerJoin(playerID, playerName) {
        this.#players.push(new Player(playerID, playerName, this.#maxPlayerDices))
        this.#totalDices = this.#players.length * this.#maxPlayerDices;
        this.#newDices();
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

    #newDices() {
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
    
    #playerRemoveDice(idx) {
        this.#players[idx].numDices--;
        this.#totalDices--;
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

    #applyRoundState(roundState, newBid) {;
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
                this.#lastBid = undefined;
                this.#newDices();
                break;
            case ROUND_STATE.PLAYER_BEFORE_LOSE:
                const playerBefore = this.#nextPlayer(this.#players, curPlayer-1, numPlayers, -1);
                this.#playerRemoveDice(playerBefore);
                this.#lastBid = undefined;
                this.#newDices();
                if (!this.#isPlayerGameOver(playerBefore))
                    this.#curPlayer = playerBefore;
                break;
            case ROUND_STATE.WIN:
                this.#lastBid = undefined;
                this.#newDices();
                break;
            case ROUND_STATE.WIN_GAIN:
                this.#players[this.#curPlayer].numDices++;
                this.#lastBid = undefined;
                this.#newDices();
                this.#totalDices++;
                break;
        }
    }
};