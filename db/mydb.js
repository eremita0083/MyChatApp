//mangooseがmongodbを使うために必要なモジュール。使う際は予めmongoを起動させておく必要がある。
//デフォルトの待ちうけはlocalの27017。 require > schema > model の順に定義。
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

//memoTextのスキーマを作成
var userSchema = mongoose.Schema({
	name:String,
	password:String,
	date:Date
});
mongoose.model('user',userSchema);
mongoose.createConnection('mongodb://localhost:27017/user');
var User = mongoose.model('user');

//contentsを保存
exports.setContents = function(id, messageText, data){
	var chat = new Chat;
	addDataToChatmodel(chat, id, messageText, data);
	//chat.saveで保存、引数はエラー時の処理の関数
	chat.save(function(err) {
	    if (err) { 
	    	console.log(err);
	    }else{
	    	//var dbData = Chat.find({}, 'date img', {sort:{date:-1}, limit:1}と設定しても、imgのネストの要素が取れなかった。
	    	//sortは-1だと最新のものから表示される。1だと古いものから表示される
	    	var dbData = Chat.find({}, 'date messageText img', {sort:{date:-1}, limit:1}, function(err, docs) {
    			console.log('@@@保存した日時' + docs[0].date); //GFIXME この書き方はIEに引っかかる
    			console.log('@@@保存したデータ::' + docs[0].messageText);
    		});
    	}
   	});
}

//チャットモデルに保存するデータを追加する。
var addDataToChatmodel = function(chat, id, messageText, data){
  	chat.fromId = id;
    chat.messageText = messageText;
	chat.date = new Date().getTime();
	chat.img = data;
}

//全データのゲッター
exports.getAllContents = function (find){
	Chat.find({},'fromId messageText date img',{sort:{date : 1}}, function(err, docs) {
    	if(err){
    		console.log('@失敗　DBから履歴読み出し失敗');
    	}else{
    		console.log('@成功　DBから履歴読み出し成功');
    		find(docs);
    	}
    });
}

//userdataの保存
exports.setUserData = function(userName,userPass,error){
	var user = new User;
	user.name = userName;
	user.password = userPass;
	user.date = new Date().getTime();
	var errStr;
	user.save(function(err){
		if(err){
			console.log(err);
			errStr = 'err';
		}else{
	    	var dbData = User.find({}, 'name password date', {sort:{date:-1}, limit:1}, function(err, docs) {
    			console.log('@@@保存した日時:' + docs[0].date || docs.date); //GFIXME この書き方はIEに引っかかる
    			console.log('@@@保存したユーザ名:' + docs[0].name || docs.name);
    			console.log('@@@保存したpass名:' + docs[0].password || docs.password);
    		});
    		errStr = '';
    	}
    		error(errStr);
	});
}

//userDataの取得
exports.getUserData = function (username, userpass, find){
	User.find({name:username, password:userpass},'name password date',{sort:{date : 1}}, function(err, docs) {
    	if(err){
    		console.log('@失敗　DBから履歴読み出し失敗');
    	}else{
    		console.log('@成功　DBから履歴読み出し成功');
    		find(docs);
    	}
    });
}