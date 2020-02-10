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

            this.landData[i].price.land = initialLandData['landData'][i].price.land;
            this.landData[i].price.building = initialLandData['landData'][i].price.building;
            this.landData[i].price.contract = initialLandData['landData'][i].price.contract;
        }
            
        
        //console.log(initialLandData);
        //console.log(initialLandData['landData'][0].price);
        // console.log('print landmanager');
        // console.log(this.landData);
    }

    InitializeLandData() {

    }
}