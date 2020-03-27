const mongoose = require('mongoose');

module.exports = () => {
  function connect() {
    mongoose.connect(process.env.DB_URL,{useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
      if (err) {
        console.error('mongodb connection error', err);
      }
      console.log('mongodb connected');
    });
  }
  connect();
  
  mongoose.connection.on('disconnected', connect);
  // require('./user.js');
  // require('/game.js');
  // require('/blockchain.js');
};