//let Blockchain = require('./blockchain.js');
import { createGenesisBlock, generateNextBlock, getLatestBlock } from './blockchain.js';
import { saveBlock } from '../Classes/DBManager.js';
let Connection = require('../Classes/Connection.js');

// GenesisBlock 생성 함수 
function createGenesis(gameLobbyID,initialData)
{
    return new Promise(function (resolve, reject) {
        let blockData = {
            eventName: "Initialize",
            eventResult: initialData
        }
        let genesisBlock = createGenesisBlock(gameLobbyID, blockData);
        saveBlock(gameLobbyID, genesisBlock)
            .then((result) => {
                resolve(genesisBlock);
            })
    })
}
function createNewBlock(gameLobbyID, eventName, eventResult) {
    return new Promise(function (resolve, reject) {

        let blockData = {
            eventName: eventName,
            eventResult: eventResult
        }
        let newBlock = generateNextBlock(blockData, gameLobbyID);
        saveBlock(gameLobbyID, newBlock)
            .then((result) => {
                resolve(newBlock);
            })
    })
}

function getLastBlock(gameLobbyID){
    return getLatestBlock(gameLobbyID);
}


exports.createGenesis = createGenesis;
exports.createNewBlock = createNewBlock;
exports.getLastBlock = getLastBlock;