module.exports = class Land {
    constructor() {
        this.id = new Number(-1);
        this.name = '';
        this.ownerID = '';
        this.price = {
            land: 0,
            building: 0,
            contract: 0
        },
            this.status = {
            land: false,
            building: false,
            contract: false
        }
        this.totalValue = 0;
    }

    calculateTotalValue() {
        let total = 0;

        // 더하기 로직
        for (let key in this.status)
        {
            if (this.status[key]){
                total += this.price[key]; 
            }
                
        }
        if (total == 0)
            total = this.price.land;
        
        this.totalValue = total;
    }
}