module.exports = class Land {
    constructor() {
        this.id = new Number(-1);
        this.name = '';
        this.ownerID = '';
        this.price = {
            land: new Number(0),
            building: new Number(0),
            contract: new Number(0)
        },
            this.status = {
            land: new Boolean(false),
            building: new Boolean(false),
            contract: new Boolean(false)
        }
        this.totalValue = new Number(0)
    }

    calculateTotalValue() {
        let total = new Number(0);

        // 더하기 로직


        this.totalValue = total;
    }
}