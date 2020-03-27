require('dotenv').config();
let io = require('socket.io')(process.env.PORT || 52300);
let Server = require('./Classes/Server');
let DB = require('./Database/db.js');
let User = require('./Database/user.js');
let BlockChain = require('./Database/blockchain.js');
let Game = require('./Database/game.js');
let crypto = require('crypto');
console.log('Server has started');

DB();
/*
let testUser = new User({
    // id: String,
    // password: { type: String, required: true },
    // name : String,
    // email: { type: String, unique: true, required: true },
    // create_date: { type:Date, default:Date.now }
    id: "test",
    password: "test111",
    name : "testuserName",
    email: "test@test.test"
});

// encryption 
let  cipher = crypto.createCipher('aes192', 'key');
cipher.update(testUser.password, 'utf8', 'base64');
let cipheredOutput = cipher.final('base64');
testUser.password = cipheredOutput;
testUser.save(function(err){
    if(err){
      console.error(err);
      //res.json({result: 0});
      return;
    }
    console.log("save complete");
    //res.json({result: 1});
  });


var query  = User.where({ id: 'test' });
query.findOne(function (err, user) {
  if (err) return handleError(err);
  if (user) {
    // doc may be null if no document matched
    let game = new Game({
      users: [user]
    });
    game.save(function(err){
      if(err){
        console.error(err);
        return;
      }
      console.log("save complete");
    })
  }
});

Game.find({}, function(err, arr) {
  if(arr){
    console.log(arr);
  }
});
*/


let server = new Server(); 

setInterval(() => {
    server.onUpdate();
}, 100, 0);

io.on('connection', function(socket) {
    let connection = server.onConnected(socket);
    connection.createEvents();
    connection.socket.emit('register', { 'id': connection.player.id });
    console.log('Connection Made!');
});