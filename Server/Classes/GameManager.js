module.exports = class GameManager {
    constructor() {
        this.lapsToGo = new Number(4);
        this.turnIndex = new Number(-1);
        this.MaxPlayer = new Number(0);
    }

    updateTurnIndex() {
        let nextTurnIndex = this.turnIndex + 1;
        if (nextTurnIndex >= this.MaxPlayer) {
            nextTurnIndex = nextTurnIndex % this.MaxPlayer;
        }
        this.turnIndex = nextTurnIndex;

        return this.turnIndex;
    }
}