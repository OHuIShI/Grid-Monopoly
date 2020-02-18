module.exports = class Connection {
    constructor() {
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }

    //Handles all our io events and where we should route them too to be handled
    createEvents() {
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;

        socket.on('disconnect', function() {
            server.onDisconnected(connection);
        });

        socket.on('joinGame', function() {
            server.onAttemptToJoinGame(connection);
        });

        //gameLobby
        socket.on('GoBankrupt', function (data) {
            connection.lobby.GoBankrupt(data);
        });
        
        socket.on('turnOver', function () {
            connection.lobby.turnOver();
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
            gameManager.CurrentPlayer = gameManager.CurrentPlayer - 1;
            let index = playersID.indexOf(players[thisPlayerID].id);
            playersID.splice(index, 1);
            delete players[thisPlayerID];
            delete sockets[thisPlayerID];
            socket.broadcast.emit('disconnected', player);
        });
    }
}