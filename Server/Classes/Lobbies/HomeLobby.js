let LobbyBase = require('./LobbyBase');
let GameLobby = require('./GameLobby')
let GameLobbySettings = require('./GameLobbySettings')
let Connection = require('../Connection');
let BlockManager = require('../../Blockchain/BlockManager.js');
let DBManager = require('../DBManager.js');

module.exports = class HomeLobby extends LobbyBase {
    constructor(id){
        super(id);
    }
    
    setUserInfo(connection = Connection, data) {
        connection.user.username = data.username;
        //console.log(connection.user.displayUserInformation());
        DBManager.saveUser({id: connection.user.id, name: connection.user.username})
        .then((result) => {
            if(result == null){
                connection.socket.emit('signupResult',{result:"success"});
            } else {
                console.log("exist user"+result);
                connection.socket.emit('signupResult',{result:"exist"});
            }
        }).catch((err) => {
            console.log(err);
            //connection.socket.emit('signupResult',{result:"fail"});
        });
    }

    onAttemptToJoinGame(connection = Connection) {
        //Look through lobbies for a gamelobby
        //check if joinable
        //if not make a new game
        let server = connection.server;
        let lobbyFound = false;

        let gameLobbies = server.lobbys.filter(item => {
            return item instanceof GameLobby;
        });
        console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        gameLobbies.forEach(lobby => {
            if(!lobbyFound) {
                let canJoin = lobby.canEnterLobby(connection);

                if(canJoin) {
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        //All game lobbies full or we have never created one
        if(!lobbyFound) {
            console.log('Making a new game lobby');
            let gamelobby = new GameLobby(gameLobbies.length + 1, new GameLobbySettings('Classic', 2));
            server.lobbys.push(gamelobby);
            server.onSwitchLobby(connection, gamelobby.id);
        }
    }
}