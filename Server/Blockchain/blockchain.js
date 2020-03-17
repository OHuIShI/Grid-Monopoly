"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoJS = __importStar(require("crypto-js"));
//let CryptoJS = require('crypto-js');
//import {broadcastLatest} from './p2p';
// 새롭게 import 되었다. 
const util_1 = require("./util");
//let hexToBinary = require('./util');
// Block 의 class 를 설정한다. 
class Block {
    constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        // 똑같이 constructor 에도 추가된다.
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}
exports.Block = Block;
let blockchains = {};
//let blockchain: Block[] = [genesisBlock];
const createGenesisBlock = (gameLobbyID, blockData) => {
    let genesisBlock = findBlock(0, CryptoJS.SHA256(gameLobbyID).toString(), getCurrentTimestamp(), blockData, 0);
    // 제네시스 블록을 가장 먼저 받아온다. 블록체인 저장을 시작하는 과정이다. 
    let blockchain = [genesisBlock];
    blockchains[gameLobbyID] = blockchain;
    return genesisBlock;
};
exports.createGenesisBlock = createGenesisBlock;
// genesisBlock 하드코딩 되어있다.
/*
const genesisBlock: Block = new Block(
    // 위의 블록구조 처럼 index, hash, previousHash, timestamp, data, difficulty, nonce 순으로 정보가 기입되어있음을 알 수 있다.
    0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, 'my genesis block!!', 0, 0
);
*/
const getBlockchain = (gameLobbyID) => blockchains[gameLobbyID];
exports.getBlockchain = getBlockchain;
// 마지막 블록의 정보를 가지고 오는 과정이다. 현 체인의 길이에서 - 1 을 한 index 를 가지고 있는 블록의 정보를 가지고 온다.
const getLatestBlock = (gameLobbyID) => blockchains[gameLobbyID][blockchains[gameLobbyID].length - 1];
exports.getLatestBlock = getLatestBlock;
// 블록 생성 주기를 설정해준다. in seconds
const BLOCK_GENERATION_INTERVAL = 10;
// 난이도 조정 주기를 설정해준다. in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
// 새롭게 추가되었다. 
const getDifficulty = (aBlockchain) => {
    const latestBlock = aBlockchain[aBlockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    }
    else {
        return latestBlock.difficulty;
    }
};
// 새롭게 추가되었다. 
const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock = aBlockchain[aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = Number(latestBlock.timestamp) - Number(prevAdjustmentBlock.timestamp);
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    }
    else {
        return prevAdjustmentBlock.difficulty;
    }
};
const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000).toString();
// 블록을 생성하는 과정이다. 
const generateNextBlock = (blockData, gameLobbyID) => {
    const previousBlock = getLatestBlock(gameLobbyID); // 새로운 블록을 만들 때 그 전 블록으로 현 체인의 마지막 블록을 설정한다. 
    const difficulty = getDifficulty(getBlockchain(gameLobbyID));
    console.log('difficulty: ' + difficulty);
    const nextIndex = previousBlock.index + 1; // index 를 설정하는 과정이다.
    const nextTimestamp = getCurrentTimestamp(); // #1 에서 약간 더 발전했다. 
    const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
    addBlock(newBlock, gameLobbyID);
    //broadcastLatest();      // import 한 {broadcastLatest}이 사용되었다.
    return newBlock;
};
exports.generateNextBlock = generateNextBlock;
// 블록을 생성하는 과정이다. 
const findBlock = (index, previousHash, timestamp, data, difficulty) => {
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};
const calculateHashForBlock = (block) => calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);
// class Block 의 요소들로 hash 값을 계산하는 과정이다. 
const calculateHash = (index, previousHash, timestamp, data, difficulty, nonce) => CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();
// 새로운 블록을 더하는 과정이다.
const addBlock = (newBlock, gameLobbyID) => {
    // 새롭게 추가될 블록이 유효한 것인지를 확인하는 과정이다. 
    if (isValidNewBlock(newBlock, getLatestBlock(gameLobbyID))) {
        blockchains[gameLobbyID].push(newBlock);
    }
};
// 블록 구조의 유효성을 판단하는 과정이다. 
const isValidBlockStructure = (block) => {
    // class Block 에서 정의된 요소들의 각 항과 일치한지 검사한다. 
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'string'
        && typeof block.data === 'object';
};
exports.isValidBlockStructure = isValidBlockStructure;
// 새로운 블록의 유효성을 판단하는 과정이다. 
const isValidNewBlock = (newBlock, previousBlock) => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid structure');
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    }
    else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
};
// 새롭게 추가되었다. 
const getAccumulatedDifficulty = (aBlockchain) => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
};
// 새롭게 추가되었다. 
const isValidTimestamp = (newBlock, previousBlock) => {
    return (Number(previousBlock.timestamp) - 60 < Number(newBlock.timestamp))
        && Number(newBlock.timestamp) - 60 < Number(getCurrentTimestamp());
};
// 새롭게 추가되었다. 
const hasValidHash = (block) => {
    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }
    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
    }
    return true;
};
// 새롭게 추가되었다. 
const hashMatchesBlockContent = (block) => {
    const blockHash = calculateHashForBlock(block);
    return blockHash === block.hash;
};
// 새롭게 추가되었다. 
const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = util_1.hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};
// 체인의 유효성을 판단하는 과정이다.
/*
const isValidChain = (blockchainToValidate: Block[]): boolean => {
    // 체인의 첫 번째 블록이 genesisBlock 과 일치하는지 확인한다.
    const isValidGenesis = (block: Block): boolean => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if (!isValidGenesis(blockchainToValidate[0])) {
        return false;
    }
    // isValidNewBlock 을 통하여 전체 체인을 검증한다.
    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false;
        }
    }
    return true;
};
*/
const addBlockToChain = (newBlock, gameLobbyID) => {
    if (isValidNewBlock(newBlock, getLatestBlock(gameLobbyID))) {
        blockchains[gameLobbyID].push(newBlock);
        return true;
    }
    return false;
};
exports.addBlockToChain = addBlockToChain;
