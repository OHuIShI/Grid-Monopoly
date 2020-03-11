//let Blockchain = require('./blockchain.js');
import { createGenesisBlock } from './blockchain.js';
let Connection = require('../Classes/Connection.js');
module.exports = class BlockManager {
    constructor(connections = Connection, gameLobbyID) {
        this.gameLobbyID = gameLobbyID;
        this.connections = connections;
    }

    // 블럭 생성 지시하는 함수
    createGenesis()
    {
        let genesisBlock = createGenesisBlock(this.gameLobbyID);
        console.log(genesisBlock);
    }
}