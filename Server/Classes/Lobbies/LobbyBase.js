let Connection = require('../Connection')

module.exports = class LobbyBase {
    constructor(id) {
        this.id = id;
        this.connections = [];
    }

    onUpdate() {        
    }

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayerPlayerInformation() + ' has entered the lobby (' + lobby.id + ')');

        //lobby.connections.push(connection);
        lobby.connections[connection.player.id] = connection;

        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayerPlayerInformation() + ' has left the lobby (' + lobby.id + ')');

        connection.lobby = undefined;

        let index = connection.player.id;

        // index가 문자열이라 조건문 확인 안해도 될 것 같긴 함
        if(index) {
            delete lobby.connections[index];
        }
    }
}