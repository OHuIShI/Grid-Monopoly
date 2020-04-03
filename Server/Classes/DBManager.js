let User = require('../Database/user.js');
let BlockChain = require('../Database/blockchain.js');
let Game = require('../Database/game.js');
let crypto = require('crypto');

function done (err, result) {
  if (err) {
    console.log("error occured");
      console.error(err);
      return;
  }
  console.log("save-complete");
  return result;
}
// 블록체인 
function saveBlock(gameLobbyID, block){
/*
  let game = getGame(gameLobbyID);

  let newBlock = new BlockChain({
      gameId : game._id,
      block : block
  })

  newBlock.save(function(err, block){
      if(err){
        console.error(err);
        return;
      }
      if(block){
          console.log("[DB] save complete - block");
          game.block.push(block);
          game.save(done);
      }
    });
    */
}

// 게임
function saveGame(gameLobbyID, playersID) {
  /*
  console.log("save Game");
  console.log("gameLobbyID = " + gameLobbyID);
  console.log("playersID = " + playersID);

  let userObjectId = [];

  playersID.forEach(player => {
      userObjectId.push(getUserObjectID(player));
  });
  
  let newGame = new Game({
      gameLobbyID : gameLobbyID,
      users: userObjectId,
      blocks: []
  })
  console.log("save Game");
  
  //newGame.save(done); 
  newGame.save(function(err, block){
    if(err){
      console.error(err);
      return;
    }
    if(block){
      console.log("[DB] save complete - game");
      return block;
    }
  });
  */
}

function getGame(gameLobbyID){
  var query = Game.where({ gameLobbyID: gameLobbyID });
  query.findOne(done);
}

//User
function saveUser(data) {
  // id: { type: String, required: true, unique: true},
  // password: { type: String, required: true },
  // name : { type: String, required: true, unique: true },
  // email: { type: String, required: true },
  let newUser = new User({
      id: data.id,
      name: data.name
  })

  newUser.save(done);
}

function getUserObjectID(id) {

}

exports.saveBlock = saveBlock;
exports.saveGame = saveGame;
exports.saveUser = saveUser;
