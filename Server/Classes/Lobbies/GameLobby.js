let LobbyBase = require('./LobbyBase')
let GameLobbySettings = require('./GameLobbySettings')
let Connection = require('../Connection')
let LandManager = require('../LandManager.js');
let GameManager = require('../GameManager.js');
let initialGameData = require('../../GameData/SampleScene.json');
let LobbyState = require('../Utility/LobbyState');
let BlockManager = require('../../Blockchain/BlockManager.js');
let DBManager = require('../DBManager.js');
var shortID = require('shortid');

module.exports = class GameLobbby extends LobbyBase {
    constructor(id, settings = GameLobbySettings) {
        super(id);
        this.settings = settings;
        this.landManager = new LandManager();
        this.gameManager = new GameManager();
        this.lobbyState = new LobbyState(settings.maxPlayers);
        this.playersID = [];
        this.gameLobbyID = shortID.generate();
        this.blockManager = new BlockManager();
    }

    onUpdate() {
        let lobby = this;

        // lobby.updateBullets();
        // lobby.updateDeadPlayers();
    }

    canEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = Object.keys(lobby.connections).length;

        if (currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }

        return true;
    }

    onSwitchReadyState(connection = Connection, data) {
        let lobby = this;
        let socket = connection.socket;
        let lobbyIndex = lobby.playersID.indexOf(connection.player.id);
        let readyStates = lobby.lobbyState.readyStates;
        readyStates[lobbyIndex] = data.state;
        //console.log("onSwitchReadyState");
        //console.log(lobby.playersID)
        // 사실 id 줄 필요 없음, 나중에 보고 id는 빼도 됨
        let returnData = {index: lobbyIndex, id: connection.player.id, state: data.state};
        console.log(returnData);
        socket.emit('changedReadyState', returnData);
        socket.broadcast.to(lobby.id).emit('changedReadyState', returnData);

        // 게임로비의 maxPlayer인원 모두가 ready이면 게임 시작
        if(Object.keys(lobby.connections).length == lobby.settings.maxPlayers) {
            if(readyStates.every(val => { return val })){
                console.log("EVERYONE READY!");
                lobby.lobbyState.currentState = lobby.lobbyState.GAME;
                // spawn 전에 loadGame 부르고 씬 로딩되기 기다려야 함
                socket.emit('loadGame');
                socket.broadcast.to(lobby.id).emit('loadGame');
                // TODO : Spawn all players in   
                lobby.onSpawnAllPlayersIntoGame(connection);
                
                let returnLobbyData = {
                    state: lobby.lobbyState.currentState
                }

                socket.emit('lobbyUpdate', returnLobbyData);
                socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnLobbyData);
                let blockData = {
                    players: lobby.playersID,
                    initialGameData : initialGameData
                }
                DBManager.saveGame(this.gameLobbyID, this.playersID);
                lobby.blockManager.createGenesis(blockData);
                socket.emit('setBlockChain',this.blockManager.getLatestBlock()); 
                socket.broadcast.to(lobby.id).emit('setBlockChain',this.blockManager.getLatestBlock());
            }
        }
    }

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let socket = connection.socket;
        let player = connection.player;

        super.onEnterLobby(connection);
        lobby.playersID.push(connection.player.id);

        lobby.lobbyState.currentState = lobby.lobbyState.GAMELOBBY;
        let returnLobbyData = {
            state: lobby.lobbyState.currentState
        }

        socket.emit('lobbyUpdate', returnLobbyData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnLobbyData);

        // console.log(returnData.id);
        //console.log('# of lobby connections : '+Object.keys(lobby.connections).length);

        // 나중에 빨리 ready 하라고 재촉하는 코드를 여기 넣을 수 있을 듯
        /*
        if(Object.keys(lobby.connections).length == lobby.settings.maxPlayers){
            console.log('We have enough players we can start the game');
            lobby.lobbyState.currentState = lobby.lobbyState.GAME;
            // spawn 전에 loadGame 부르고 씬 로딩되기 기다려야함
            socket.emit('loadGame');
            socket.broadcast.to(lobby.id).emit('loadGame');
            // TODO : Spawn all players in   
            lobby.onSpawnAllPlayersIntoGame(connection);
        }
        */
        let lobbyIndex = lobby.playersID.indexOf(connection.player.id);
        let returnData = {
            index: lobbyIndex,
            id: player.id,
            name: player.username,
        }
        //LobbyState.js에 기록한대로 나중에 GameLobby State를 따로 만들면 좋을 듯
        //socket.emit('OnEnterGameLobby', returnData);
        socket.broadcast.to(lobby.id).emit('OnEnterGameLobby', returnData);
        
        for (let i in lobby.playersID){
            console.log(lobby.playersID[i]);
            let returnData = {
                index: i,
                id: lobby.playersID[i],
                name: lobby.connections[lobby.playersID[i]].player.username,
            }
            socket.emit('OnEnterGameLobby', returnData);
        }
    }

    initialSetting(connection = Connection) {
        console.log("initialSetting");
        let lobby = this;

        // 호출 순서 중요
        lobby.initializeGameSetting(connection);
        lobby.addPlayer(connection);
        //Handle spawning any server spawned objects here
        //Example: loot, perhaps flying bullets etc
    }

    onSpawnAllPlayersIntoGame(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        //console.log("SPAWN하라고쫌");
        // connections.forEach(connection => {
        //     console.log('addPlayer : '+connection.id);
        //     lobby.addPlayer(connection);
        // });
        // for (let c in connections)
        // {
        //     console.log("HIHI");
        //     lobby.addPlayer(connections[c]);
        // }
        
        // add all players to playersID(turn order array)
        // for (let c in connections)
        // { 
        //     lobby.playersID.push(connections[c].player.id);
        // }
        // console.log('before shuffle : ');
        // for (let i in lobby.playersID){
        //     console.log(lobby.playersID[i]);
        // }
        // shuffle turn order
        for (let i = lobby.settings.maxPlayers - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lobby.playersID[i], lobby.playersID[j]] = [lobby.playersID[j], lobby.playersID[i]];
        }
        // console.log('after:');
        // for (let i in lobby.playersID){
        //     console.log(lobby.playersID[i]);
        // }
        // set all players' initial settings
        for (let c in connections)
        { 
            connections[c].player.order = lobby.playersID.indexOf(connections[c].player.id);
            connections[c].player.balance = initialGameData['initialBalance'];
            connections[c].player.assets = initialGameData['initialBalance'];
        }
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
        console.log(lobby.playersID);

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
    }

    initializeGameSetting(connection = Connection) {
        let lobby = this;
        connection.socket.emit('initializeGameSetting');
    }

    addPlayer(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;
        let player = connection.player;

        lobby.gameManager.CurrentPlayer = lobby.gameManager.CurrentPlayer + 1;
        //console.log('My order:'+player.order);
        socket.emit('spawn', player); //tell myself I have spawned
        //이걸 게임로비를 만들면 주석풀고 활용해야할듯 spawn말고 게임로비에 들어왔다는 신호로
        //socket.broadcast.to(lobby.id).emit('spawn', player); // Tell others

        console.log("tell myself about everyone else:" + player.id);

        for (let c in connections)
        { 
            if (connections[c].player.id != player.id) {
                console.log("spawn emit:"+connections[c].player.id);
                socket.emit('spawn', connections[c].player);
            }
        }

        //Tell myself about everyone else already in the lobby
        /*
        connections.forEach(c => {
            console.log("check");
            if (connections[c].player.id != connection.player.id) {
                console.log("spawn emit");
                socket.emit('spawn', c.player);
            }
        });
        */
        //console.log("# of players:"+lobby.gameManager.CurrentPlayer);
        if (lobby.gameManager.CurrentPlayer == lobby.settings.maxPlayers) {
            console.log('UPDATETURN');
            connections[lobby.playersID[0]].player.SetIsMyTurn(true);
            console.log(lobby.playersID[0]+'\'s TURN');
            console.log(connections[lobby.playersID[0]].player.isMyTurn);
            console.log(connections[lobby.playersID[1]].player.isMyTurn);
            lobby.gameManager.turnIndex = 0;
            lobby.gameManager.lapsToGo = lobby.gameManager.lapsToGo - 1;
            let returnData = {
                id: lobby.playersID[0],
                lapsToGo: lobby.gameManager.lapsToGo
            }
            lobby.blockManager.createNewBlock('updateTurn', returnData);
            connections[lobby.playersID[0]].socket.emit('updateTurn',this.blockManager.getLatestBlock());
            connections[lobby.playersID[0]].socket.broadcast.to(lobby.id).emit('updateTurn',this.blockManager.getLatestBlock());
        }
    }

    updateBalance(connection = Connection, data) {
        console.log('updateBalance');
        let senderID = data.senderID;
        let receiverID = data.receiverID;
        let cost = data.cost;
        let lobby = this;
        let connections = lobby.connections;
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
        lobby.blockManager.createNewBlock('updateBalance', data);
        
        connection.socket.emit('updateBalance',this.blockManager.getLatestBlock());
        connection.socket.broadcast.to(lobby.id).emit('updateBalance',this.blockManager.getLatestBlock());
    }

    updateLandData(connection = Connection, data){
        console.log('updateLandData');
        let landIndex = data.landIndex;
        let state = data.state;
        let id = data.id;
        let prevOwnerID = 0;
        let lobby = this;
        let landManager = lobby.landManager;
        let connections = lobby.connections;
        
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
                connections[prevOwnerID].player.assets -= landManager.landData[landIndex].totalValue;

                landManager.landData[landIndex].ownerID = id;
                for (let key in landManager.landData[landIndex].status)
                {
                    landManager.landData[landIndex].status.key = false;    
                }
                landManager.landData[landIndex].calculateTotalValue();
                data['prevOwnerId'] = prevOwnerID;
                data['prevOwnerAssets'] = connections[prevOwnerID].player.assets;
                break;
        }
        data['totalValue'] = landManager.landData[landIndex].totalValue;
        lobby.blockManager.createNewBlock('updateLandData', data);
        connection.socket.emit('updateLandData',this.blockManager.getLatestBlock());
        connection.socket.broadcast.to(lobby.id).emit('updateLandData',this.blockManager.getLatestBlock());
    }

    turnOver(connection = Connection) {
        console.log('turnOver');
        let lobby = this;
        let gameManager = lobby.gameManager;
        let connections = lobby.connections;
        let playersID = lobby.playersID;
        
        if (gameManager.lapsToGo >= 0) {
            if (lobby.playersID.length == 1) {
                let winnerIndex = 0;
                let winner;
                let ranking = [];
                let bankruptPlayer = [];
    
                for (var key in connections) ranking.push(key);
    
                ranking.sort(function (a, b) {
                    console.log("sorting");
    
                    console.log(connections[b].player.assets - connections[a].player.assets);
                    return connections[b].player.assets - connections[a].player.assets;
                })
                console.log('after sorting');
                console.log(ranking);
                /*
                for (let i = 0; i < gameManager.CurrentPlayer; i++) {
                    if (connections[playersID[i]].player.assets > connections[playersID[winnerIndex]].player.assets) {
                        winnerIndex = i;
                    }
                }
                console.log('gameOver, winner: ', connections[playersID[winnerIndex]].player.id);
                */
                
                let returnData = {
                    winner: ranking[0],
                    ranking: ranking
                }
                lobby.lobbyState.currentState = lobby.lobbyState.ENDGAME;
                let returnLobbyData = {
                    state: lobby.lobbyState.currentState
                }

                lobby.blockManager.createNewBlock('gameOver', returnData);
                connection.socket.emit('gameOver',this.blockManager.getLatestBlock());
                connection.socket.broadcast.to(lobby.id).emit('gameOver',this.blockManager.getLatestBlock());
                
                connection.socket.emit('lobbyUpdate', returnLobbyData);
                connection.socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnLobbyData);
            } else {
                let nextTurnIndex = gameManager.updateTurnIndex();
                let nextTurnID = connections[playersID[nextTurnIndex]].player.id;

                if (nextTurnID == lobby.playersID[0])
                {
                    gameManager.lapsToGo = gameManager.lapsToGo - 1;
                    if (gameManager.lapsToGo < 0)
                        return this.turnOver(connection);
                }

                let returnData = {
                    id: nextTurnID,
                    lapsToGo: gameManager.lapsToGo
                }
                lobby.blockManager.createNewBlock('updateTurn', returnData);
                connection.socket.emit('updateTurn',this.blockManager.getLatestBlock());
                connection.socket.broadcast.to(lobby.id).emit('updateTurn',this.blockManager.getLatestBlock());
            }
        } else {
            let winnerIndex = 0;
            let winner;
            let ranking = [];
            let bankruptPlayer = [];

            for (var key in connections) ranking.push(key);

            ranking.sort(function (a, b) {
                console.log("sorting");

                console.log(connections[b].player.assets - connections[a].player.assets);
                return connections[b].player.assets - connections[a].player.assets;
            })
            console.log('after sorting');
            console.log(ranking);
            /*
            for (let i = 0; i < gameManager.CurrentPlayer; i++) {
                if (connections[playersID[i]].player.assets > connections[playersID[winnerIndex]].player.assets) {
                    winnerIndex = i;
                }
            }
            console.log('gameOver, winner: ', connections[playersID[winnerIndex]].player.id);
            */
            
            let returnData = {
                winner: ranking[0],
                ranking: ranking
            }
            lobby.lobbyState.currentState = lobby.lobbyState.ENDGAME;
            let returnLobbyData = {
                state: lobby.lobbyState.currentState
            }

            console.log(returnData);
            lobby.blockManager.createNewBlock('gameOver', returnData);
            connection.socket.emit('gameOver',this.blockManager.getLatestBlock());
            connection.socket.broadcast.to(lobby.id).emit('gameOver',this.blockManager.getLatestBlock());
                        
            connection.socket.emit('lobbyUpdate', returnLobbyData);
            connection.socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnLobbyData);
        }
    }

    rollDices(connection = Connection) {
        let lobby = this;
        console.log('rollDices');
        let distDice = Math.floor(Math.random() * (2 * lobby.gameManager.mapLength)) + 1;
        //let distDice = 100;
        let dirDice = Math.floor(Math.random() * (4));
        //let dirDice = 0;
        let x = connection.player.position.x; // 당장 가야할 x
        let y = connection.player.position.y; // 당장 가야할 y
        let maxLength = parseInt(lobby.gameManager.mapLength / 2);
        let minLength = maxLength * (-1);
        let dist = distDice; // 남은 거리 이동 횟수
        let dir = dirDice;

        switch (dir) {
            case 0: {
                y += dist;
                if (y > maxLength) {
                    //dist -= maxLength;
                    y = maxLength;
                    dist -= Math.abs(y - connection.player.position.y);
                } else dist = 0;
                break;
            }
            case 1: {
                x += dist;
                if (x > maxLength) {
                    //dist -= maxLength;
                    x = maxLength;
                    dist -= Math.abs(x - connection.player.position.x);
                } else dist = 0;
                break;
            }
            case 2: {
                y -= dist;
                if (y < minLength) {
                    //dist -= maxLength;
                    y = minLength;
                    dist -= Math.abs(y - connection.player.position.y);
                } else dist = 0;
                break;
            }
            case 3: {
                x -= dist;
                if (x < minLength) {
                    //dist -= maxLength;
                    x = minLength;
                    dist -= Math.abs(x - connection.player.position.x);
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
        lobby.blockManager.createNewBlock('updatePosition', returnData);
        
        connection.socket.emit('updatePosition',this.blockManager.getLatestBlock());
        connection.socket.broadcast.to(lobby.id).emit('updatePosition',this.blockManager.getLatestBlock());
    }   
    
    GoBankrupt(connection = Connection,data)
    {
        let lobby = this;
        let connections = lobby.connections;
        console.log('GoBankrupt');
            let id = data.id;
            
            connections[id].player.assets = 0;
            connections[id].player.balance = 0;
            for (var i = 0; i < lobby.landManager.landData.length; i++)
            {
                lobby.landManager.landData[i].ownerID = "";
                lobby.landManager.landData[i].totalValue = 0;
                
                for (let key in lobby.landManager.landData[i].status)
                lobby.landManager.landData[i].status[key] = false;
            }
    
            let playerIndex = lobby.playersID.indexOf(id);
            lobby.playersID.splice(playerIndex, 1);
            lobby.gameManager.CurrentPlayer = lobby.gameManager.CurrentPlayer - 1;
    
            lobby.gameManager.afterBankrupt = true;
            
            lobby.blockManager.createNewBlock('GoBankrupt', data);
            connection.socket.emit('GoBankrupt',this.blockManager.getLatestBlock());
            connection.socket.broadcast.to(lobby.id).emit('GoBankrupt',this.blockManager.getLatestBlock());
    }

    selectDirection(connection = Connection, data)
    { 
        let lobby = this;
        console.log('selectDir');
            let distDice = connection.player.dist;
            let dirDice = data.selectedDIR;
            let x = connection.player.position.x; // 당장 가야할 x
            let y = connection.player.position.y; // 당장 가야할 y
            let maxLength=parseInt(lobby.gameManager.mapLength/2);
            let minLength=maxLength*(-1);
            let dist = connection.player.dist; // 남은 거리 이동 횟수
    
            switch (dirDice) {
                case 0: {
                    y += dist;
                    if (y > maxLength) {
                        //dist -= maxLength;
                        y = maxLength;
                        dist -= Math.abs(y - connection.player.position.y);
                    } else dist = 0;
                    break;
                }
                case 1: {
                    x += dist;
                    if (x > maxLength) {
                        //dist -= maxLength;
                        x = maxLength;
                        dist -= Math.abs(x - connection.player.position.x);
                    } else dist = 0;
                    break;
                }
                case 2: {
                    y -= dist;
                    if (y < minLength) {
                        //dist -= maxLength;
                        y = minLength;
                        dist -= Math.abs(y - connection.player.position.y);
                    } else dist = 0;
                    break;
                }
                case 3: {
                    x -= dist;
                    if (x < minLength) {
                        //dist -= maxLength;
                        x = minLength;
                        dist -= Math.abs(x - connection.player.position.x);
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
            
            connection.player.updatePosition(returnData);
            connection.player.showPlayerData();
        
            lobby.blockManager.createNewBlock('updatePosition', returnData);
            connection.socket.emit('updatePosition',this.blockManager.getLatestBlock());
            connection.socket.broadcast.to(lobby.id).emit('updatePosition',this.blockManager.getLatestBlock());
    }
}