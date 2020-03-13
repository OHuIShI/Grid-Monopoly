let Land = require('./Land.js');
let GameManager = require('./GameManager.js');
let initialGameData = require('../GameData/SampleScene.json');

module.exports = class LandManager {
    constructor() {
        this.landData = new Array(25);

        for (var i = 0; i < this.landData.length; i++)
        {
            this.landData[i] = new Land();

            this.landData[i].id = initialGameData['landData'][i].id;
            this.landData[i].name = initialGameData['landData'][i].name;

            for (let key in this.landData[i].price)
            {
                this.landData[i].price[key] = initialGameData['landData'][i].price[key];
            }
        }
    }

    InitializeLandData() {
        // 정체를 알 수 없는 함수
    }
}