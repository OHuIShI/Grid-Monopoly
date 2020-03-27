const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const gameSchema = new Schema({
    gameLobbyID:{type: String, required: true},
    create_date: { type:Date, default:Date.now },
    users: [{type: Schema.Types.ObjectId, ref: 'user', required: true}],
    blocks: [{type: Schema.Types.ObjectId, ref: 'block'}]
});

module.exports = mongoose.model('Game', gameSchema);