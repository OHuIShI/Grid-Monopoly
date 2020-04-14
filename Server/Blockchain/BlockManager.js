//let Blockchain = require('./blockchain.js');
import { createGenesisBlock, generateNextBlock, getLatestBlock } from './blockchain.js';
import { saveBlock } from '../Classes/DBManager.js';
let Connection = require('../Classes/Connection.js');

// GenesisBlock 생성 함수 
function createGenesis(gameLobbyID, initialData)
{
    return new Promise(function (resolve, reject) {
        let blockData = {
            eventName: "Initialize",
            eventResult: initialData
        }
        let genesisBlock = createGenesisBlock(gameLobbyID, blockData);
        // saveBlock(gameLobbyID, genesisBlock)
        // .then((result) => {
        //     //showBlock(genesisBlock);
        //     resolve(genesisBlock);
        // });
        //showBlock(genesisBlock);
        saveBlock(gameLobbyID, genesisBlock)
        .then((result)=>{
            showBlock(genesisBlock);
        })
        .then((result) => {
            //showBlock(genesisBlock);
            resolve(genesisBlock);
        });
    })
}
function createNewBlock(gameLobbyID, eventName, eventResult) {
    return new Promise(function (resolve, reject) {
        let blockData = {
            eventName: eventName,
            eventResult: eventResult
        }
        let newBlock = generateNextBlock(blockData, gameLobbyID);
    
        // saveBlock(gameLobbyID, newBlock)
        // .then((result) => {
        //     //showBlock(newBlock)
        //     resolve(newBlock);
        // });
        //showBlock(newBlock);
        saveBlock(gameLobbyID, newBlock)
        .then((result)=>{
            showBlock(newBlock);
        })
        .then((result) => {
            //showBlock(newBlock)
            resolve(newBlock);
        });
    })
}

function showBlock(block) {
    return new Promise(function (resolve, reject){

    let date = new Date(block.timestamp*1000);   
    let dataformat = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    let prevHash1 = block.previousHash.substr(0,32);
    let prevHash2 = block.previousHash.substr(32,32);
    let blockHash1 = block.hash.substr(0,32);
    let blockHash2 = block.hash.substr(32,32);
    console.log("|------------------------------------------------|");
    console.log("|  "+block.index+"  "+"|   "+dataformat+"\t\t\t |");
    console.log("|------------------------------------------------|");
    console.log("|  prevHash : "+prevHash1+"   |");
    console.log("|  "+prevHash2+"\t\t |");
    console.log("|  difficulty : "+block.difficulty+"\t\t\t\t |");
    console.log("|  nonce : "+block.nonce+"\t\t\t\t\t |");
    console.log("|  data :\t\t\t\t\t\t\t");
    console.log(JSON.stringify(block.data,null,"|  "));
    console.log("|------------------------------------------------|");
    console.log("|  block hash | "+blockHash1+" |");
    console.log("|------------------------------------------------|");
    console.log("                        \(                         ");
    console.log("                        \)                         ");
    console.log("                        \(                         ");
    resolve();
});
}

function getLastBlock(gameLobbyID){
    return getLatestBlock(gameLobbyID);
}


exports.createGenesis = createGenesis;
exports.createNewBlock = createNewBlock;
exports.getLastBlock = getLastBlock;