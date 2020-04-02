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
  return new Promise(function (resolve, reject) {
    console.log("save Block - start");
    // let game = getGame(gameLobbyID);
    getGame(gameLobbyID)
      .then(data => {
        let game = data;
        let newBlock = new BlockChain({
          gameId: game._id,
          block: block
        })
        newBlock.save({ newBlock })
          .then((result) => {
            game.blocks.push(result);
            game.save({game})
            .then((result => {
              resolve();
            }))
          })
          .catch((err) => {
            console.log("error occured");
            reject(err);
          })
      })
  })
}

// 게임
function saveGame(gameLobbyID, playersID) {

  return new Promise(function (resolve, reject) {

    let userObjectId = [];

    playersID.forEach(player => {
      userObjectId.push(player);
    });

    let newGame = new Game({
      gameLobbyID: gameLobbyID,
      users: userObjectId,
      blocks: []
    })
    newGame.save({ newGame })
      .then((result) => {
        resolve('save Game end');
        return result;
      })
      .catch((err) => {
        console.log("error occured");
        console.log(err);
      })

  })
}

function getGame(gameLobbyID) {
  return new Promise(function (resolve, reject) {
    var query = Game.where({ gameLobbyID: gameLobbyID });
    query.findOne(function (err, block) {
      if (err) {
        console.error(err);
        return;
      }
      if (block) {
        resolve(block);
      }
    });
  })

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
