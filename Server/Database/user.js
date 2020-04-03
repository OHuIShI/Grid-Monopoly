const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const userSchema = new Schema({
  id: { type: String, required: true, unique: true},
  name : { type: String, required: true, unique: true },
  create_date: { type:Date, default:Date.now }
});

module.exports = mongoose.model('User', userSchema);


/*
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name :{ type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});


var userSchema = mongoose.Schema({
    username: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    diplayName: String,
    bio: String
  });
*/