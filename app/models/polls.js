const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

var pollSchema = new mongoose.Schema({
    title: String,
    id : String,
    author : String,
    options: Array,
    date: { type: Date, default: Date.now },
    }, {collection: 'polls'}
);

module.exports = mongoose.model('Poll', pollSchema);
