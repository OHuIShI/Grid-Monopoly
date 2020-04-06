//let Blockchain = require('./blockchain.js');
import { createGenesisBlock, generateNextBlock, getLatestBlock } from './blockchain.js';
import { saveBlock } from '../Classes/DBManager.js';
let Connection = require('../Classes/Connection.js');
/*
module.exports = class BlockManager {
    constructor(gameLobbyID) {
        console.log("blockManager constructor");
        console.log(gameLobbyID);
        this.gameLobbyID = gameLobbyID
        console.log(this.gameLobbyID);
    }

    // GenesisBlock 생성 함수 
    createGenesis(initialData)
    {
        return new Promise(function (resolve, reject) {
            let blockData = {
                eventName: "Initialize",
                eventResult: initialData
            }

            console.log("inside createGenesis gameLobbyID");
            console.log(this.gameLobbyID);
            let genesisBlock = createGenesisBlock(this.gameLobbyID, blockData);
            console.log(genesisBlock);
            saveBlock(this.gameLobbyID, genesisBlock)
                .then((result) => {
                    console.log(result);
                    resolve('create and save genesis end');
                })
        })
    }
    createNewBlock(eventName, eventResult){
        let blockData = {
            eventName: eventName,
            eventResult: eventResult
        }
        let newBlock = generateNextBlock(blockData, this.gameLobbyID);
        saveBlock(this.gameLobbyID, newBlock);
        return newBlock;
    }
    getLatestBlock(){
        return getLatestBlock(this.gameLobbyID);
    }
}*/

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
                console.log(result);
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
                console.log(result);
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