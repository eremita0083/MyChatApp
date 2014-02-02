var mongoose = require('mongoose');

//memoTextのスキーマを作成
var chatTextSchema = mongoose.Schema({
	fromId:String,
	messageText:String,
	date:Date,
	img:String
	// img:{file:String, name:String, size:Number}でかいたら何故か駄目だった。
});
mongoose.model('chat',chatTextSchema);
mongoose.connect('mongodb://localhost:27017/chat');
var Chat = mongoose.model('chat');

exports.getChatmodel = function() {
	return Chat;
};