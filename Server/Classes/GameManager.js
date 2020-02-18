module.exports = class GameManager {
    constructor() {
        this.lapsToGo = new Number(5);
        this.turnIndex = new Number(-1);
        this.MaxPlayer = new Number(0);
        this.mapLength = new Number(5);
        this.afterBankrupt = false;
    }

    updateTurnIndex() {
        let nextTurnIndex = this.turnIndex + 1;
        if (nextTurnIndex >= this.MaxPlayer) {
            nextTurnIndex = 0;
            this.afterBankrupt = false;
        }
        else if (this.afterBankrupt)
        {
            this.afterBankrupt = false;
            nextTurnIndex = this.turnIndex;
        }
        this.turnIndex = nextTurnIndex;

        return this.turnIndex;
    }
}