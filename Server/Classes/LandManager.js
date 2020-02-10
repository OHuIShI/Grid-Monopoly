let Land = require('./Land.js');
let GameManager = require('./GameManager.js');
let initialLandData = require('../GameData/SampleScene.json');

module.exports = class LandManager {
    constructor() {
        this.landData = new Array(25);

        for (var i = 0; i < this.landData.length; i++)
        {
            this.landData[i] = new Land();

            this.landData[i].id = initialLandData['landData'][i].id;
            this.landData[i].name = initialLandData['landData'][i].name;

            for (let key in this.landData[i].price)
            {
                this.landData[i].price[key] = initialLandData['landData'][i].price[key];
            }
        }
    }

    InitializeLandData() {

    }
}