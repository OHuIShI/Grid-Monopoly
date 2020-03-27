let User = require('./Database/user.js');
let BlockChain = require('./Database/blockchain.js');
let Game = require('./Database/game.js');
let crypto = require('crypto');

module.exports = class DBManager {
    done(err, result){
        if(err){
            console.error(err);
            return;
        }
        console.log("save-complete");
        return result;
    }
    // 블록체인 
    saveBlock(gameLobbyID, block){

        let game = getGame(gameLobbyID);

        let newBlock = new Block({
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
    }

    // 게임
    saveGame(gameLobbyID, playersID) {
        /*
        gameLobbyID:{type: String, required: true},
        create_date: { type:Date, default:Date.now },
        users: [{type: Schema.Types.ObjectId, ref: 'user', required: true}],
        blocks: [{type: Schema.Types.ObjectId, ref: 'block'}]
        */

        let userObjectId = [];

        playersID.array.forEach(player => {
            userObjectId.push(getUserObjectID(player));
        });
        
        let newGame = new Game({
            eLobbyID : gamgameLobbyID,
            users: userObjectId,
            blocks: []
        })

        newGame.save(done);
    }

    getGame(gameLobbyID){
        var query = Game.where({ gameLobbyID: gameLobbyID });
        query.findOne(done);
    }

    //User
    saveUser() {
        /*
        id: { type: String, required: true, unique: true},
        password: { type: String, required: true },
        name : { type: String, required: true, unique: true },
        email: { type: String, required: true },
        create_date: { type:Date, default:Date.now }
        */
        let newUser = new User({
            id:
            pr189
        })

        newUser.save(done);
    }

    getUserObjectID(id) {

    }
    
}
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