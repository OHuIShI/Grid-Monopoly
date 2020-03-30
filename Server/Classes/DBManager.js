let User = require('../Database/user.js');
let BlockChain = require('../Database/blockchain.js');
let Game = require('../Database/game.js');
let crypto = require('crypto');

function done(err, result) {
  if (err) {
    console.log("error occured");
    console.error(err);
    return;
  }
  console.log("save-complete");
  return result;
}
// 블록체인 
function saveBlock(gameLobbyID, block) {
  console.log("save Block - start");
  let game = getGame(gameLobbyID);
  console.log("game id = " + game._id);

  let newBlock = new BlockChain({
    gameId: game._id,
    block: block
  })
  /*
    newBlock.save(function (err, block) {
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
  }
  */
  newBlock.save({ newBlock })
    .then((result) => {
      console.log("save block - done");
      console.log(result);
      return result;
    })
    .catch((err) => {
      console.log("error occured");
      console.log(err);
    })
}

// 게임
function saveGame(gameLobbyID, playersID) {
  console.log("save Game");

  let userObjectId = [];

  playersID.forEach(player => {
    userObjectId.push(player);
  });

  let newGame = new Game({
    gameLobbyID: gameLobbyID,
    users: userObjectId,
    blocks: []
  })

  /*
    //newGame.save(done); 
    newGame.save(function (err, block) {
      if (err) {
        console.error(err);
        return;
      }
      if (block) {
        console.log("[DB] save complete - game");
        return block;
      }
    });
  */
  newGame.save({ newGame })
    .then((result) => {
      console.log("save game");
      console.log(result);
      return result;
    })
    .catch((err) => {
      console.log("error occured");
      console.log(err);
    })
}
function getGame(gameLobbyID) {
  var query = Game.where({ gameLobbyID: gameLobbyID });
  query.findOne(function (err, block) {
    console.log("findOne");
    if (err) {
      console.error(err);
      return;
    }
    if (block) {
      console.log("[DB] find complete - game");
      return block;
    }
  });
}


//User
function saveUser() {

  let newUser = new User({
    id:
      pr189
  })

  newUser.save(done);
}

function getUserObjectID(id) {

}

exports.saveBlock = saveBlock;
exports.saveGame = saveGame;
