let LobbyBase = require('./LobbyBase');
let Connection = require('../Connection');
let BlockManager = require('../../Blockchain/BlockManager.js');
let DBManager = require('../DBManager.js');

module.exports = class HomeLobby extends LobbyBase {
    constructor(id){
        super(id);
        this.blockManager = new BlockManager();
    }

}