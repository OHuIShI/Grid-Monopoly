let Connection = require('./Connection')
let User = require('./User')

//Lobbies
let LobbyBase = require('./Lobbies/LobbyBase')
let HomeLobby = require('./Lobbies/HomeLobby')
let GameLobby = require('./Lobbies/GameLobby')
let GameLobbySettings = require('./Lobbies/GameLobbySettings')

module.exports = class Server {
    constructor() {
        this.connections = [];
        this.lobbys = [];
        this.lobbys[0] = new HomeLobby(0);
    }

    //Interval update every 100 miliseconds
    onUpdate() {
        let server = this;

        //Update each lobby
        for(let id in server.lobbys) {
            server.lobbys[id].onUpdate();
        }
    }

    //Handle a new connection to the server
    onConnected(socket) {
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.server = server;
        connection.user = new User();

        let user = connection.user;
        let lobbys = server.lobbys;

        console.log('Added new user to the server (' + user.id + ')');
        server.connections[user.id] = connection;

        socket.join(user.lobby);
        connection.lobby = lobbys[user.lobby];
        connection.lobby.onEnterLobby(connection);

        return connection;
    }

    onDisconnected(connection = Connection) {
        let server = this;
        let id = connection.user.id;

        delete server.connections[id];
        console.log('User ' + connection.user.displayUserInformation() + ' has disconnected');

        //Tell Other players currently in the lobby that we have disconnected from the game
        connection.socket.broadcast.to(connection.user.lobby).emit('disconnected', {
            id: id
        });

        //Preform lobby clean up
        let currentLobbyIndex = connection.user.lobby;
        //server.lobbys[connection.player.lobby].onLeaveLobby(connection);
        server.lobbys[currentLobbyIndex].onLeaveLobby(connection);
        
        if(currentLobbyIndex != 0 && Object.keys(server.lobbys[currentLobbyIndex].connections).length == 0){
            console.log('Closing down lobby ('+currentLobbyIndex+')');
            server.lobbys.splice(currentLobbyIndex, 1);
        }
    }
    
    onSwitchLobby(connection = Connection, lobbyID) {
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyID); // Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyID];//assign reference to the new lobby
        
        lobbys[connection.user.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }
}