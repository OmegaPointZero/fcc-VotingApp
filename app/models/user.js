const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

var userSchema = new mongoose.Schema({
        username: String,
        email: String,
        password : String,
        paidUntil: Number,
        userID: Number,
        isAdmin: Boolean
    }, { collection: 'userbase' }
);

//Hashing the password (add salt?)
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

//Compare and check if password is correct
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema) 
