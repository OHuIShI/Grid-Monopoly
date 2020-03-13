// //import * as WebSocket from 'ws';
// //import {Server} from 'ws';
// import {addBlockToChain, Block, getBlockchain, getLatestBlock, isValidBlockStructure, replaceChain} from './blockchain';
// //const sockets: WebSocket[] = [];
// enum MessageType {
//     QUERY_LATEST = 0,
//     QUERY_ALL = 1,
//     RESPONSE_BLOCKCHAIN = 2,
// }
// class Message {
//     public type: MessageType;
//     public data: any;
// }
// const JSONToObject = <T>(data: string): T => {
//     try {
//         return JSON.parse(data);
//     } catch (e) {
//         console.log(e);
//         return null;
//     }
// };
// const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));
// const broadcast = (message: Message): void => sockets.forEach((socket) => write(socket, message));
// const queryChainLengthMsg = (): Message => ({'type': MessageType.QUERY_LATEST, 'data': null});
// const queryAllMsg = (): Message => ({'type': MessageType.QUERY_ALL, 'data': null});
// const responseChainMsg = (): Message => ({
//     'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getBlockchain())
// });
// const responseLatestMsg = (): Message => ({
//     'type': MessageType.RESPONSE_BLOCKCHAIN,
//     'data': JSON.stringify([getLatestBlock()])
// });
// const handleBlockchainResponse = (receivedBlocks: Block[]) => {
//     if (receivedBlocks.length === 0) {
//         console.log('received block chain size of 0');
//         return;
//     }
//     const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
//     if (!isValidBlockStructure(latestBlockReceived)) {
//         console.log('block structuture not valid');
//         return;
//     }
//     const latestBlockHeld: Block = getLatestBlock();
//     if (latestBlockReceived.index > latestBlockHeld.index) {
//         console.log('blockchain possibly behind. We got: '
//             + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
//         if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
//             if (addBlockToChain(latestBlockReceived)) {
//                 broadcast(responseLatestMsg());
//             }
//         } else if (receivedBlocks.length === 1) {
//             console.log('We have to query the chain from our peer');
//             broadcast(queryAllMsg());
//         } else {
//             console.log('Received blockchain is longer than current blockchain');
//             replaceChain(receivedBlocks);
//         }
//     } else {
//         console.log('received blockchain is not longer than received blockchain. Do nothing');
//     }
// };
// const broadcastLatest = (): void => {
//     broadcast(responseLatestMsg());
// };
