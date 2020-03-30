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
        let user = connection.user;

        console.log('User ' + user.displayUserInformation() + ' has entered the lobby (' + lobby.id + ')');

        //lobby.connections.push(connection);
        lobby.connections[connection.user.id] = connection;

        user.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;
        let user = connection.user;

        console.log('User ' + user.displayUserInformation() + ' has left the lobby (' + lobby.id + ')');

        // user.lobby = undefined; 이런거 안하나?
        connection.lobby = undefined;

        let index = user.id;

        // index가 문자열이라 조건문 확인 안해도 될 것 같긴 함
        if(index) {
            delete lobby.connections[index];
        }
    }
}