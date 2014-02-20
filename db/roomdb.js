var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
	room:{type:String, required: true},
	master:{type:String, required: true},
	date:{ type: Date, default: new Date().getTime()}
});