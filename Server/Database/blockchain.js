const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const blockchainSchema = new Schema({
    gameId : {type: Schema.Types.ObjectId, ref : 'game', required: true},
    block : {type: Object, required: true}
});

module.exports = mongoose.model('Blockchain', blockchainSchema);