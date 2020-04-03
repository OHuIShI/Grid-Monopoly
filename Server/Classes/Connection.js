module.exports = class Connection {
    constructor() {
        this.socket;
        this.user;
        this.server;
        this.lobby;
        this.player;
    }

    //Handles all our io events and where we should route them too to be handled
    createEvents() {
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;

        socket.on('joinGame', function() {
            connection.lobby.onAttemptToJoinGame(connection);
        });

        socket.on('setUserInfo', function(data) {
            connection.lobby.setUserInfo(connection, data);
        });

        socket.on('enteredGame', function () {
            connection.lobby.initialSetting(connection);
        });

        socket.on('onSwitchReadyState', function (data) {
            connection.lobby.onSwitchReadyState(connection, data);
        });

        //gameLobby
        socket.on('GoBankrupt', function (data) {
            connection.lobby.GoBankrupt(connection, data);
        });
        
        socket.on('turnOver', function () {
            connection.lobby.turnOver(connection);
        });
    
        //gameLobby
        // 주사위 굴려주기
        socket.on('rollDices', function () {
            connection.lobby.rollDices(connection);
        });

        //gameLobby
        socket.on('selectDirection', function(data){
            connection.lobby.selectDirection(connection, data);
        });

        socket.on('updateLandData', function (data) {
            connection.lobby.updateLandData(connection, data);
        });
    
        socket.on('updateBalance', function (data) {
            connection.lobby.updateBalance(connection, data); 
        });
        
        socket.on('disconnect', function(){
            console.log('A player has disconnected');
            server.onDisconnected(connection);
        });
    }
}