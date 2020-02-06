let io = require('socket.io')(process.env.PORT || 52300);
//let Server = require('./Classes/Server')
let Player = require('./Classes/Player.js');
let GameManager = require('./Classes/GameManager.js');

console.log('Server has started');

let players = [];
let playersID = [];
let sockets = [];
let gameManager = new GameManager();
/*
let server = new Server();

setInterval(() => {
    server.onUpdate();
}, 100, 0);
*/
io.on('connection', function(socket){
    console.log('Connection Made!');

    let player = new Player();
    let thisPlayerID = player.id;
    players[thisPlayerID] = player;
    playersID.push(thisPlayerID);
    gameManager.MaxPlayer = gameManager.MaxPlayer + 1; // maxPlayer 수 현재상황에서는 동적임
    sockets[thisPlayerID] = socket;

    //Tell the client that this is our id for the server
    socket.emit('register', {id: thisPlayerID});
    socket.emit('spawn', player); //Tell myself I have spawned
    socket.broadcast.emit('spawn', player); //Tell other I have spawned

    //Tell myself about everyone else in the game
    for(var playerID in players) {
        if(playerID != thisPlayerID) {
            socket.emit('spawn', players[playerID]);
        }
    }

    // 첫 번째 turn 정하기
    // lobby가 생기면 바꿔야 하는 부분
    if (players.length() == 1) {
        players[thisPlayerID].SetIsMyTurn(true);
        gameManager.turnIndex = 0;
        let returnData = {
            id: thisPlayerID,
            lapsToGo: gameManager.lapsToGo
        }
        socket.emit('updateTurn', returnData);
    }

    socket.on('turnOver', function () {
        console.log('turnOver');
        gameManager.lapsToGo = gameManager.lapsToGo - 1;

        if (gameManager.lapsToGo > 0) {
            let nextTurnIndex = gameManager.updateTurnIndex();
            let nextTurnID = players[playersID[nextTurnIndex]].id;

            let returnData = {
                id: nextTurnID,
                lapsToGo: gameManager.lapsToGo
            }

            socket.emit('updateTurn', returnData);
            socket.broadcast.emit('updateTurn', returnData);
        } else {

            let returnData = {
                // 게임 결과
            }
            socket.emit('gameOver', returnData);
            socket.broadcast.emit('gameOver', returnData);
        }
        
    });

    // 주사위 굴려주기
    socket.on('rollDices', function () {
        console.log('rollDices');
        let returnData = {

        }
        socket.emit('updatePosition', returnData);
        socket.broadcast.emit('updatePosition', returnData);
    });

    socket.on('updatePosition', function(data) {
        player.position.x = data.position.x;
        player.position.y = data.position.y;

        socket.broadcast.emit('updatePosition', player);
    });

    socket.on('disconnect', function(){
        console.log('A player has disconnected');
        gameManager.MaxPlayer = gameManager.MaxPlayer - 1;
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];

        socket.broadcast.emit('disconnected', player);
    });
});