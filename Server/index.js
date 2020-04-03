require('dotenv').config();
let io = require('socket.io')(process.env.PORT || 52300);
let Server = require('./Classes/Server');
let DB = require('./Database/db.js');

console.log('Server has started');
DB();

let server = new Server(); 

setInterval(() => {
    server.onUpdate();
}, 100, 0);

io.on('connection', function(socket) {
    let connection = server.onConnected(socket);
    connection.createEvents();
    connection.socket.emit('register', { 'id': connection.user.id });
    console.log('Connection Made!');
});