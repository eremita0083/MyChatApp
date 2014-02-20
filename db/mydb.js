var mongoose = require('mongoose');

//chatのスキーマを作成
var chatTextSchema = mongoose.Schema({
	name:String,
	messageText:String,
	date:{ type: Date, default: new Date().getTime()},
	img:String
});
mongoose.model('chat',chatTextSchema);
mongoose.connect('mongodb://localhost:27017/chat');
var Chat = mongoose.model('chat');

//userのスキーマを作成
var userSchema = mongoose.Schema({
	name:{ type: String, required: true },
	password:{ type: String, required: true },
	date:{ type: Date, default: new Date().getTime() }
});
mongoose.model('user',userSchema);
mongoose.createConnection('mongodb://localhost:27017/user');
var User = mongoose.model('user');

//login情報のスキーマを作成
var loginSchema = mongoose.Schema({
	name:{ type: String, required: false },
	id:{ type: String, required: false },
	date:{ type: Date, default: new Date().getTime() }
});
mongoose.model('login', loginSchema);
mongoose.createConnection('mongodb://localhost:27017/login');
var Login = mongoose.model('login');

//contentsを保存
exports.setContents = function(name, messageText, data){
	var chat = new Chat;
	addDataToChatmodel(chat, name, messageText, data);
	chat.save(function(err) {
	    if (err) { 
	    	console.log(err);
	    }else{
	    	var dbData = Chat.find({}, 'date messageText img', {sort:{date:-1}, limit:1}, function(err, docs) {
    			console.log('@@@保存した日時' + docs[0].date);//この記述はIEに引っかかる。
    			console.log('@@@保存したデータ::' + docs[0].messageText);
    		});
    	}
   	});
}

//チャットモデルに保存するデータを追加する。
var addDataToChatmodel = function(chat, name, messageText, data){
  	chat.name = name;
    chat.messageText = messageText;
	/*chat.date = new Date().getTime();*/
	chat.img = data;
}

//全データのゲッター
exports.getAllContents = function (find){
//DBから履歴を読み取り、送信する
//DBにデータがある場合には読み込み、クライアントに送信する。第一引数はクエリ。第二引数の列名は半角スペースで複数記述できる'a b c'。nullなら全列検索。
// 第三引数はoption、ソートやlimit。第四引数はコールバック。
	Chat.find({},'name messageText date img',{sort:{date : 1}}, function(err, docs) {
    	if(err){
    		console.log('@失敗　DBから履歴読み出し失敗');
    	}else{
    		console.log('@成功　DBから履歴読み出し成功');
    		find(docs);
    	}
    });
}

//userDataの取得
var getUserData = function (username, userpass, find){
	User.find({name:username, password:userpass},'name password date',{sort:{date : 1}}, function(err, docs) {
    	if(err){
    		console.log('@失敗　DBから履歴読み出し失敗');
    	}else{
    		console.log('@成功　DBから履歴読み出し成功');
    		find(docs);
    	}
    });
}
exports.getUserData = getUserData;

/*　こんな書き方もできるが、今ので安定しているのでそちらを使う。
var getOneUser = function(userName,confirmError){
	User.findOne({name:req.body.name}, function(err, obj){
		if(err){
    		console.log('@失敗　DBから履歴読み出し失敗');
    	}else if (obj){
    		console.log('dupricate userdata');
    	}else{
    		//user読み取りが失敗でなく、重複していない場合の処理
    	}
	});
}*/

//userdataの保存
exports.setUserData = function(userName,userPass,confirmError){
	var errStr;
	getUserData(userName,userPass,function(docs){
		var userLength = docs.length;
		console.log('同じ名前のユーザ数は'+ userLength+ '人です');
		if(userLength >= 1 ){
			console.log('ユーザ pass dupricate です');
			errStr = 'dup';
			confirmError(errStr);
			return;
		}else{
			var user = new User;
			user.name = userName;
			user.password = userPass;
			user.date = new Date().getTime();
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
		    	confirmError(errStr);
			});
		}
	});
}


exports.setLoginData = function(username, id){
	var log = new Login;
	log.name = username;
	log.id = id;
	log.save(function(err){
		if(err){
			console.log(err);
		}else{
			console.log('@@保存成功setLoginData user:' + username + ' loginid:' + id );
		}
	});
}

exports.getLoginData = function(id,react){
	console.log('@@getlogin socketid: '+ id);
	Login.findOne({id:id},'name id date', function(err,docs) {
		if(err){
			console.log(err);
		}else{
			console.log('@@取り出し成功getLoginData userName:' + docs.name);
			react(docs);
		}
	});
}

exports.removeLogin = function(username,sid){
	Login.remove({name: username, id:sid}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log('@@remove login follow data. user:' + username + ' socketId:'+sid);
		}
	});
}