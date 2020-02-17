let io = require('socket.io')(process.env.PORT || 52300);
//let Server = require('./Classes/Server')
let Player = require('./Classes/Player.js');
let GameManager = require('./Classes/GameManager.js');
let LandManager = require('./Classes/LandManager.js');
let initialGameData = require('./GameData/SampleScene.json');

console.log('Server has started');

let players = [];
let playersID = [];
let sockets = [];
let gameManager = new GameManager();
let landManager = new LandManager();
// console.log(landManager.landData);
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
    player.order = playersID.indexOf(players[thisPlayerID].id); // 매치에서 플레이어 순서 -> lobby 생기면 logic 바꿔야함
    player.balance = initialGameData['initialBalance'];
    console.log('player order: '+ player.order);
    gameManager.MaxPlayer = gameManager.MaxPlayer + 1; // maxPlayer 수 현재상황에서는 동적임
    sockets[thisPlayerID] = socket;
    
    //Tell the client that this is our id for the server
    socket.emit('register', {id: thisPlayerID, items : landManager.landData});
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
    if (gameManager.MaxPlayer == 1) {
        console.log('UPDATETURN');
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
            console.log('nextTurnIndex: ' + nextTurnIndex);
            console.log('nextTurnPlayerId: ' + playersID[nextTurnIndex]);
            let nextTurnID = players[playersID[nextTurnIndex]].id;

            let returnData = {
                id: nextTurnID,
                lapsToGo: gameManager.lapsToGo
            }
            console.log(returnData);
            socket.emit('updateTurn', returnData);
            socket.broadcast.emit('updateTurn', returnData);
        } else {
            let winnerIndex = 0;
            for(let i=0;i<gameManager.MaxPlayer;i++){
                if(players[playersID[i]].assets > players[playersID[winnerIndex]].assets){
                    winnerIndex = i;
                }
            }
            console.log('gameOver, winner: ', playerID[winnerIndex]);
            let returnData = {
                winner: playerID[winnerIndex]
            }
            socket.emit('gameOver', returnData);
            socket.broadcast.emit('gameOver', returnData);
        }
        
    });

    // 주사위 굴려주기
    socket.on('rollDices', function () {
        console.log('rollDices');
        //let distDice = Math.floor(Math.random() * (2 * gameManager.mapLength)) + 1;
        let distDice = 0;
        let dirDice = Math.floor(Math.random()*(4));
        let x=player.position.x; // 당장 가야할 x
        let y=player.position.y; // 당장 가야할 y
        let maxLength=parseInt(gameManager.mapLength/2);
        let minLength=maxLength*(-1);
        let dist = distDice; // 남은 거리 이동 횟수
        let dir = dirDice;

        switch(dir){
            case 0: {
                y+=dist;
                if(y>maxLength){
                    dist -= maxLength;
                    y = maxLength;
                } else dist = 0;
                break;
            }
            case 1: {
                x+=dist;
                if(x>maxLength){
                    dist -= maxLength;
                    x = maxLength;
                } else dist = 0;
                break;
            }
            case 2: {
                y-=dist; 
                if(y<minLength){
                    dist -= maxLength;
                    y = minLength;
                } else dist = 0;
                break;
            }
            case 3: {
                x-=dist;
                if(x<minLength){
                    dist -= maxLength;
                    x = minLength;
                } else dist = 0;
                break;
            } 
        }
        
        let dx = Math.abs(x - player.position.x);
        let dy = Math.abs(y - player.position.y);

        let returnData = {
            id: thisPlayerID,
            DIR: dirDice, // 방향주사위 눈
            DIST: distDice, // 거리주사위 눈
            x: x, // 당장 가야할 x
            y: y, // 당장 가야할 y
            dist: dist // 남은 거리 이동 횟수
        }
        
        player.updatePosition(returnData);
        console.log(returnData);
        player.showPlayerData();
        socket.emit('updatePosition', returnData);
        socket.broadcast.emit('updatePosition', returnData);
    });

    socket.on('selectDirection', function(data){
        console.log('selectDir');
        console.log(data);
        let distDice = player.distDice;
        let dirDice = player.dirDice;
        let x=player.position.x; // 당장 가야할 x
        let y=player.position.y; // 당장 가야할 y
        let maxLength=parseInt(gameManager.mapLength/2);
        let minLength=maxLength*(-1);
        let dist = player.dist; // 남은 거리 이동 횟수
        let dir = data.selectedDIR;

        switch(dir){
            case 0: {
                y+=dist;
                if(y>maxLength){
                    dist -= maxLength;
                    y = maxLength;
                } else dist = 0;
                break;
            }
            case 1: {
                x+=dist;
                if(x>maxLength){
                    dist -= maxLength;
                    x = maxLength;
                } else dist = 0;
                break;
            }
            case 2: {
                y-=dist; 
                if(y<minLength){
                    dist -= maxLength;
                    y = minLength;
                } else dist = 0;
                break;
            }
            case 3: {
                x-=dist;
                if(x<minLength){
                    dist -= maxLength;
                    x = minLength;
                } else dist = 0;
                break;
            } 
        }

        let returnData = {
            id: thisPlayerID,
            DIR: dirDice, // 방향주사위 눈
            DIST: distDice, // 거리주사위 눈
            x: x, // 당장 가야할 x
            y: y, // 당장 가야할 y
            dist: dist // 남은 거리 이동 횟수
        }
        
        player.updatePosition(returnData);
        console.log(returnData);
        player.showPlayerData();
        socket.emit('updatePosition', returnData);
        socket.broadcast.emit('updatePosition', returnData);

    });

    socket.on('updateLandData', function (data) {
        console.log('updateLandData');
        let landIndex = data.landIndex;
        let state = data.state;
        let id = data.id;
        let prevOwnerID = 0;
        
        switch (state)
        {
            case "BuyLand":
                console.log("BuyLand");
                landManager.landData[landIndex].ownerID = id;
                landManager.landData[landIndex].status.land = true;
                landManager.landData[landIndex].calculateTotalValue();
                players[landManager.landData[landIndex].ownerID].assets += landManager.landData[landIndex].totalValue;
                data['ownerAssets'] = players[landManager.landData[landIndex].ownerID].assets;
                break;
            case "Building":
                console.log("Building");
                landManager.landData[landIndex].status.building = true;
                landManager.landData[landIndex].calculateTotalValue();
                players[landManager.landData[landIndex].ownerID].assets += landManager.landData[landIndex].totalValue;
                data['ownerAssets'] = players[landManager.landData[landIndex].ownerID].assets;
                break;
            case "Contract":
                console.log("Contract");
                landManager.landData[landIndex].status.contract = true;
                landManager.landData[landIndex].calculateTotalValue();
                players[landManager.landData[landIndex].ownerID].assets += landManager.landData[landIndex].totalValue;
                data['ownerAssets'] = players[landManager.landData[landIndex].ownerID].assets;
                break;
            case "Acquire":
                console.log("Acquire");
                prevOwnerID = landManager.landData[landIndex].ownerID;
                players[prevOwnerID].assets -= landManager.landData[landIndex].totalValue;
                players[landManager.landData[landIndex].ownerID].assets += landManager.landData[landIndex].totalValue;
                landManager.landData[landIndex].ownerID = id;
                data['ownerAssets'] = players[landManager.landData[landIndex].ownerID].assets;
                data['prevOwnerId'] = prevOwnerID;
                data['prevOwnerAssets'] = players[prevOwnerID].assets;
                break;
            case "Sell":
                console.log("Sell");
                prevOwnerID = landManager.landData[landIndex].ownerID;
                players[prevOwnerID].assets -= landManager.landData[landIndex].totalValue;

                landManager.landData[landIndex].ownerID = id;
                for (let key in landManager.landData[landIndex].status)
                {
                    landManager.landData[landIndex].status.key = false;    
                }
                landManager.landData[landIndex].calculateTotalValue();
                data['prevOwnerId'] = prevOwnerID;
                data['prevOwnerAssets'] = players[prevOwnerID].assets;
                break;
        }
        data['totalValue'] = landManager.landData[landIndex].totalValue;
        console.log('change totalValue :' + data['totalValue']);
        socket.emit('updateLandData', data);
        socket.broadcast.emit('updateLandData', data);
    });

    socket.on('updateBalance', function (data) {
        console.log('updateBalance');
        let senderID = data.senderID;
        let receiverID = data.receiverID;
        let cost = data.cost;

        if (senderID != "")
        {
            players[senderID].balance -= cost;
            players[senderID].assets -= cost;
            data['senderAssets'] = players[senderID].assets;
        }
        
        if (receiverID != "")
        {
            players[receiverID].balance += cost;
            players[receiverID].assets += cost;
            data['receiverAssets'] = players[receiverID].assets;
        }

        socket.emit('updateBalance', data);
        socket.broadcast.emit('updateBalance', data);
    });
    
    socket.on('disconnect', function(){
        console.log('A player has disconnected');
        gameManager.MaxPlayer = gameManager.MaxPlayer - 1;
        let index = playersID.indexOf(players[thisPlayerID].id);
        playersID.splice(index, 1);
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
        socket.broadcast.emit('disconnected', player);
    });
});