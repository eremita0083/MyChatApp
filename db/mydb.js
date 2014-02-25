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
	friend:[User],
	date:{ type: Date, default: new Date().getTime() }
});
mongoose.model('user',userSchema);
mongoose.createConnection('mongodb://localhost:27017/user');
var User = mongoose.model('user');

//chat login情報のスキーマを作成
var loginSchema = mongoose.Schema({
	name:{ type: String, required: false },
	id:{ type: String, required: false },
	date:{ type: Date, default: new Date().getTime() }
});
mongoose.model('login', loginSchema);
mongoose.createConnection('mongodb://localhost:27017/login');
var Login = mongoose.model('login');

//room ルーム情報の保存
var roomSchema = mongoose.Schema({
	name:{type:String, required: false},
	password:{type:String, required: true},
	master:{type:String, required: true},
	date:{ type: Date, default: new Date().getTime()}
});
mongoose.model('room', roomSchema);
mongoose.createConnection('mongodb://localhost:27017/room');
var Room = mongoose.model('room');

//roomにおけるチャット履歴の保存
var roomHistorySchema = mongoose.Schema({
	name:{type:String, required: true},
	password:{type:String, required: true},
	messageText:{type:String, required: true},
	publisher:{type:String, required: true},
	date:{ type: Date, default: new Date().getTime()}
});
mongoose.model('roomhistory', roomHistorySchema);
mongoose.createConnection('mongodb://localhost:27017/roomhistory');
var RoomHistory = mongoose.model('roomhistory');

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

var getUserDataForFriendAPI = function (friendName, find){
	User.find({name:friendName},'name password date',{sort:{date : 1}}, function(err, docs) {
    	if(err){
    		console.log('@失敗　DBから履歴読み出し失敗');
    	}else{
    		console.log('@成功　DBから履歴読み出し成功');
    		find(docs);
    	}
    });
}
exports.getUserDataForFriendAPI = getUserDataForFriendAPI;

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

var getRandomUserData = function (react){
	User.find({},'name password date',{sort:{date : 1}, limit:10}, function(err, users) {
    	if(err){
    		console.log('@失敗　DBから履歴読み出し失敗');
    	}else{
    		console.log('@成功　DBから履歴読み出し成功');
    		react(users);
    	}
    });
}
exports.getRandomUserData = getRandomUserData;

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

//userにfriendを追加
exports.setFriendToUser = function(userName, friendName){
	getUserDataForFriendAPI(friendName,function(user){
		User.update({name:userName}, {'$push': 
			{friend: user}
		}, { upsert: true, multi: false },function(err){
			if(err){
				console.log(err);
			}
		});
	});
}

//userのfriend情報をゲット 
exports.getFriend = function(userName,react){
	User.find({name:userName},function(err,user){
		if(err){
			console.log(err);
		}else{
			react(user.friend);
		}
	});
}

/*以下login データ*/
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
			react(docs);
		}
	});
}

exports.removeLogin = function(sid){
	Login.remove({id:sid}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log('@@remove login follow data. socketId:'+sid);
		}
	});
}

/*　以下 room*/

/*roomname:{type:String, required: true},
	password:{type:String, required: true},
	messageText:{type:String, required: true},
	publisher:{type:String, required: true},
	date:{ type: Date, default: new Date().getTime()}*/
exports.createRoom = function(data){
	var room = new Room;
	room.name = data.name;
	room.password = data.password;
	room.master = data.master;
	room.save(function(err){
		if(err){
			console.log(err);
		}else{
			console.log('@room作成　成功');
		}
	});
}
exports.getRooms = function(roomName,roomPass){
	Room.find({name:roomName, password:roomPass},'name password master date', {sort:{date:-1}, limit:20}, function(err,docs){
		if(err){
			console.log(err);
		}else{
			return docs;
		}
	});
}

exports.getTheRoomDataForCreate = function(roomName, react){
	Room.find({name:roomName},'name password master date', function(err,doc){
		if(err){
			console.log(err);
		}else{
			react(doc);
			// return じゃ情報取得できない
		}
	});
}
exports.getTheRoomDataForEnter = function(roomName, roomPass, react){
	Room.find({name:roomName, password:roomPass},'name password master date', function(err,doc){
		if(err){
			console.log(err);
		}else{
			react(doc);
			// return doc;
		}
	});
}
exports.removeRoom = function(roomName, roomMaster){
	Room.remove({name:roomName, master:roomMaster}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log('@room削除: ' + roomName);
		}
	});
}

/*　以下 roomの会話履歴
roomname:{type:String, required: true},
password:{type:String, required: true},
messageText:{type:String, required: true},
publisher:{type:String, required: true},
date:{ type: Date, default: new Date().getTime()}*/
exports.saveRoomHistory = function(data){
	var roomhistory = new RoomHistory;
	roomhistory.name = data.name;
	roomhistory.messageText = data.messageText;
	roomhistory.publisher = data.publisher;
	roomhistory.save(function(err){
		if(err){
			console.log(err);
			console.log('@@roomhistory保存　失敗');
		}else{
			console.log('@roomhistory保存　成功');
		}
	});
}
exports.getRoomHistory = function(data){
	RoomHistory.find({name:data.name, password:data.password },'name password messageText publisher date', {sort:{date:-1}, limit:20}, function(err,docs){
		if(err){
			console.log(err);
		}else{
			return docs;
		}
	});
}
exports.removeRoomHistory = function(data){
	RoomHistory.remove({name:data.name, password:data.password}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log('@room削除: ' + data.name);
		}
	});
}
