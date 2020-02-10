let Land = require('./Land.js');
let GameManager = require('./GameManager.js');

module.exports = class LandManager {
    constructor() {
        this.landData = new Array(25);

        for (var i = 0; i < this.landData.length; i++)
            this.landData[i] = new Land();
        
        console.log('print landmanager');
        console.log(this.landData);
    }

    InitializeLandData() {
        
    }
}