let LobbyBase = require('./LobbyBase')
let GameLobbySettings = require('./GameLobbySettings')
let Connection = require('../Connection')
let LandManager = require('../LandManager.js');
let GameManager = require('../GameManager.js');
let initialGameData = require('../../GameData/SampleScene.json');

module.exports = class GameLobbby extends LobbyBase {
    constructor(id, settings = GameLobbySettings) {
        super(id);
        this.settings = settings;
        this.landManager = new LandManager();
        this.gameManager = new GameManager();
        this.playersID = [];
    }

    onUpdate() {
        let lobby = this;

        // lobby.updateBullets();
        // lobby.updateDeadPlayers();
    }

    canEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if (currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }

        return true;
    }

    onEnterLobby(connection = Connection) {
        let lobby = this;

        super.onEnterLobby(connection);

        lobby.addPlayer(connection);

        //Handle spawning any server spawned objects here
        //Example: loot, perhaps flying bullets etc
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;

        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);

        //Handle unspawning any server spawned objects here
        //Example: loot, perhaps flying bullets etc
    }

    removePlayer(connection = Connection) {
        let lobby = this;

        lobby.gameManager.CurrentPlayer = lobby.gameManager.CurrentPlayer - 1;
        let index = lobby.playersID.indexOf(connection.player.id);
        lobby.playersID.splice(index, 1);

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
    }

    initializeGameSetting() {
        connection.socket.emit('initializeGameSetting', { items: landManager.landData });
    }

    addPlayer(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;
        let player = connection.player;

        lobby.playersID.push(player.id);
        player.order = lobby.playersID.indexOf(player.id);
        player.balance = initialGameData['initialBalance'];
        player.assets = initialGameData['initialBalance'];

        lobby.gameManager.CurrentPlayer = lobby.gameManager.CurrentPlayer + 1;

        socket.emit('spawn', player); //tell myself I have spawned
        socket.broadcast.to(lobby.id).emit('spawn', player); // Tell others

        console.log("tell myself about everyone else");
        console.log(connections);

        //Tell myself about everyone else already in the lobby
        connections.forEach(c => {
            console.log("check");
            if (c.player.id != connection.player.id) {
                console.log("spawn emit");
                socket.emit('spawn', c.player);
            }
        });

        if (lobby.gameManager.CurrentPlayer == 1) {
            console.log('UPDATETURN');
            connections[player.id].player.SetIsMyTurn(true);
            lobby.gameManager.turnIndex = 0;
            let returnData = {
                id: player.id,
                lapsToGo: lobby.gameManager.lapsToGo
            }
            socket.emit('updateTurn', returnData);
        }
    }

    updateBalance(connection = Connection, data) {
        console.log('updateBalance');
        let senderID = data.senderID;
        let receiverID = data.receiverID;
        let cost = data.cost;
        if (senderID != "") {
            connections[senderID].player.balance -= cost;
            connections[senderID].player.assets -= cost;
            data['senderAssets'] = connections[senderID].player.assets;
        }

        if (receiverID != "") {
            connections[receiverID].player.balance += cost;
            connections[receiverID].player.assets += cost;
            data['receiverAssets'] = connections[receiverID].player.assets;
        }

        connection.socket.emit('updateBalance', data);
        connection.socket.broadcast.to(lobby.id).emit('updateBalance', data);
    }

    updateLandData(connection = Connection, data){
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
                connections[id].player.assets += landManager.landData[landIndex].price.land;
                data['ownerAssets'] = connections[id].player.assets;
                break;
            case "Building":
                console.log("Building");
                landManager.landData[landIndex].status.building = true;
                landManager.landData[landIndex].calculateTotalValue();
                connections[landManager.landData[landIndex].ownerID].player.assets += landManager.landData[landIndex].price.building;
                data['ownerAssets'] = connections[landManager.landData[landIndex].ownerID].player.assets;
                break;
            case "Contract":
                console.log("Contract");
                landManager.landData[landIndex].status.contract = true;
                landManager.landData[landIndex].calculateTotalValue();
                connections[landManager.landData[landIndex].ownerID].player.assets += landManager.landData[landIndex].price.contract;
                data['ownerAssets'] = connections[landManager.landData[landIndex].ownerID].player.assets;
                break;
            case "Acquire":
                console.log("Acquire");
                prevOwnerID = landManager.landData[landIndex].ownerID;
                connections[prevOwnerID].player.assets -= landManager.landData[landIndex].totalValue;
                landManager.landData[landIndex].ownerID = id;
                connections[landManager.landData[landIndex].ownerID].player.assets += landManager.landData[landIndex].totalValue;
                data['ownerAssets'] = connections[landManager.landData[landIndex].ownerID].player.assets;
                data['prevOwnerId'] = prevOwnerID;
                data['prevOwnerAssets'] = connections[prevOwnerID].player.assets;
                break;
            case "Sell":
                console.log("Sell");
                prevOwnerID = landManager.landData[landIndex].ownerID;
                connections[prevOwnerID].assets -= landManager.landData[landIndex].totalValue;

                landManager.landData[landIndex].ownerID = id;
                for (let key in landManager.landData[landIndex].status)
                {
                    landManager.landData[landIndex].status.key = false;    
                }
                landManager.landData[landIndex].calculateTotalValue();
                data['prevOwnerId'] = prevOwnerID;
                data['prevOwnerAssets'] = connections[prevOwnerID].assets;
                break;
        }
        data['totalValue'] = landManager.landData[landIndex].totalValue;
        connection.socket.emit('updateLandData', data);
        connection.socket.broadcast.emit('updateLandData', data);
    }

    turnOver() {
        console.log('turnOver');
        gameManager.lapsToGo = gameManager.lapsToGo - 1;

        if (gameManager.lapsToGo > 0) {
            if (lobby.playersID.length == 1) {
                let returnData = {
                    winner: connections[lobby.playersID[0]].player.id
                }
                connection.socket.emit('gameOver', returnData);
                connection.socket.broadcast.to(lobby.id).emit('gameOver', returnData);
            } else {
                let nextTurnIndex = gameManager.updateTurnIndex();
                console.log('nextTurnIndex: ' + nextTurnIndex);
                console.log('nextTurnPlayerId: ' + lobby.playersID[nextTurnIndex]);
                let nextTurnID = connections[playersID[nextTurnIndex]].player.id;

                let returnData = {
                    id: nextTurnID,
                    lapsToGo: gameManager.lapsToGo
                }
                console.log(returnData);
                connection.socket.emit('updateTurn', returnData);
                connection.socket.broadcast.to(lobby.id).emit('updateTurn', returnData);
            }
        } else {
            let winnerIndex = 0;
            for (let i = 0; i < gameManager.CurrentPlayer; i++) {
                if (connections[playersID[i]].player.assets > connections[playersID[winnerIndex]].player.assets) {
                    winnerIndex = i;
                }
            }
            console.log('gameOver, winner: ', connections[playersID[winnerIndex]].player.id);
            let returnData = {
                winner: connections[playersID[winnerIndex]].player.id
            }
            connection.socket.emit('gameOver', returnData);
            connection.socket.broadcast.to(lobby.id).emit('gameOver', returnData);
        }
    }

    rollDices(connection = Connection) {
        console.log('rollDices');
        //let distDice = Math.floor(Math.random() * (2 * gameManager.mapLength)) + 1;
        let distDice = 0;
        let dirDice = Math.floor(Math.random() * (4));
        let x = connection.player.position.x; // 당장 가야할 x
        let y = connection.player.position.y; // 당장 가야할 y
        let maxLength = parseInt(gameManager.mapLength / 2);
        let minLength = maxLength * (-1);
        let dist = distDice; // 남은 거리 이동 횟수
        let dir = dirDice;

        switch (dir) {
            case 0: {
                y += dist;
                if (y > maxLength) {
                    dist -= maxLength;
                    y = maxLength;
                } else dist = 0;
                break;
            }
            case 1: {
                x += dist;
                if (x > maxLength) {
                    dist -= maxLength;
                    x = maxLength;
                } else dist = 0;
                break;
            }
            case 2: {
                y -= dist;
                if (y < minLength) {
                    dist -= maxLength;
                    y = minLength;
                } else dist = 0;
                break;
            }
            case 3: {
                x -= dist;
                if (x < minLength) {
                    dist -= maxLength;
                    x = minLength;
                } else dist = 0;
                break;
            }
        }

        let dx = Math.abs(x - connection.player.position.x);
        let dy = Math.abs(y - connection.player.position.y);

        let returnData = {
            id: connection.player.id,
            DIR: dirDice, // 방향주사위 눈
            DIST: distDice, // 거리주사위 눈
            x: x, // 당장 가야할 x
            y: y, // 당장 가야할 y
            dist: dist // 남은 거리 이동 횟수
        }

        connection.player.updatePosition(returnData);
        connection.player.showPlayerData();
        connection.socket.emit('updatePosition', returnData);
        connection.socket.broadcast.to(lobby.id).emit('updatePosition', returnData);
    }   
    
    GoBankrupt(data)
    {
        console.log('GoBankrupt');
            let id = data.id;
            
            connections[id].player.assets = 0;
            connections[id].player.balance = 0;
            for (var i = 0; i < landManager.landData.length; i++)
            {
                landManager.landData[i].ownerID = "";
                landManager.landData[i].totalValue = 0;
                
                for (let key in landManager.landData[i].status)
                landManager.landData[i].status[key] = false;
            }
    
            let playerIndex = playersID.indexOf(id);
            playersID.splice(playerIndex, 1);
            gameManager.CurrentPlayer = gameManager.CurrentPlayer - 1;
    
            gameManager.afterBankrupt = true;
            
            connection.socket.emit('GoBankrupt', data);
            connection.socket.broadcast.to(lobby.id).emit('GoBankrupt', data);
    }

    selectDirection(connection = Connection, data)
    { 
        console.log('selectDir');
            let distDice = connection.player.distDice;
            let dirDice = connection.player.dirDice;
            let x = connection.player.position.x; // 당장 가야할 x
            let y = connection.player.position.y; // 당장 가야할 y
            let maxLength=parseInt(gameManager.mapLength/2);
            let minLength=maxLength*(-1);
            let dist = connection.player.dist; // 남은 거리 이동 횟수
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
                id: connection.player.id,
                DIR: dirDice, // 방향주사위 눈
                DIST: distDice, // 거리주사위 눈
                x: x, // 당장 가야할 x
                y: y, // 당장 가야할 y
                dist: dist // 남은 거리 이동 횟수
            }
            
            player.updatePosition(returnData);
            player.showPlayerData();
            connection.socket.emit('updatePosition', returnData);
            connection.socket.broadcast.to(lobby.id).emit('updatePosition', returnData);
    }
}