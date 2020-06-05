const Schema = require('mongoose').Schema;

const matchSchema = new Schema({
    userId: {type: Number, required: true, unique: true},
    matches: [{type: Number}],
    likes: [{type: Number}]
});

const roomSchema = new Schema({
    users: [{type: Number}]
});
module.exports = {matchSchema, roomSchema};