module.exports = class Land {
    constructor() {
        this.id = new Number(-1);
        this.name = '';
        this.ownerID = new Number(-1);
        this.price = new Array(
            { colName: 'land', value:Number(0)},
            { colName: 'building', value:Number(0)},
            { colName: 'contract', value:Number(0)},
        ),
        this.status = new Array(
            { colName: 'land', value:Boolean(false)},
            { colName: 'building', value:Boolean(false)},
            { colName: 'contract', value:Boolean(false)},
        ),
        this.totalValue = new Number(0)
    }

    calculateTotalValue() {
        let total = new Number(0);

        // 더하기 로직


        this.totalValue = total;
    }
}