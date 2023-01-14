export class Player{
    #id
    #name

    constructor(id, name, numDices) {
        this.#id = id;
        this.#name = name;
        this.dices = this.newDices();
        this.numDices = numDices;
    }

    getID() {
        return this.#id;
    }

    getName() {
        return this.#name;
    }

    serialize() {
        return {
            id: this.#id,
            name: this.#name
        }
    }

    newDices() {
        this.dices = Array.from({length: this.numDices}, () => Math.trunc(Math.random()*6) + 1)
    }

}