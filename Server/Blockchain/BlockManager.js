//let Blockchain = require('./blockchain.js');
import { createGenesisBlock, generateNextBlock, getLatestBlock } from './blockchain.js';
let Connection = require('../Classes/Connection.js');
module.exports = class BlockManager {
    constructor(connections = Connection, gameLobbyID) {
        this.gameLobbyID = gameLobbyID
    }

    // GenesisBlock 생성 함수 
    createGenesis(initialData)
    {
        let blockData = {
            eventName: "Initialize",
            eventResult: initialData
        }
        
        let genesisBlock = createGenesisBlock(this.gameLobbyID, blockData);
        console.log(genesisBlock);
        return genesisBlock;
    }
    createNewBlock(eventName, eventResult){
        let blockData = {
            eventName: eventName,
            eventResult: eventResult
        }
        let newBlock = generateNextBlock(blockData, this.gameLobbyID);

        return newBlock;
    }
    getLatestBlock(){
        return getLatestBlock(this.gameLobbyID);
    }
}                   