var db = require('../db/mydb.js');

exports.testroom = function(req,res){
	//TODO　create or enterの判定を行う
	var room = req.body.room;
	var select = req.body.room.select;
	var user = req.session.user.name;
	var data = {name:room.name, password: room.pwd, master: user};
	console.log('@testroom select ' + select);
	if(select === 'enter'){
		//enterの場合、該当するルームがあるか確認。あるなら、joinのための準備へ。
		db.getTheRoomDataForEnter(data.name,data.password, function(doc){
			var docLength = 0;
			for(var j in doc){
				docLength +=1;
			}
			console.log('@enter '+ docLength);
			if(docLength===0){
				//dataがなかったらlobbyへ
				res.redirect('/roomlobby');
			}else{
				//dataがあれば　roomへ
				req.session.room = data;
				res.redirect('/room');
			}
		});
	}else {
		//create の場合、他のルーム情報とかぶっていないか確認、DBに情報を詰める
		// result でdataがとれていない。
		db.getTheRoomDataForCreate(data.name,function(doc){
			var docLength = 0;
			for(var j in doc){
				docLength +=1;
			}
			if(docLength > 0){
				//roomのかぶり
				console.log('@testroom create redirect');
				res.redirect('/roomlobby');
			}else{
				//roomかぶりなし
				console.log('@testroom create createroom');
				db.createRoom({name:data.name, password:data.password, master:data.master});
				req.session.room = data;
				res.redirect('/room');
			}
		});
	}
}

exports.room = function(req,res){
	if(!req.session.user){
		res.redirect('/login');
	}else{
		res.render('room', { title: 'my chat app', user: req.session.user, room:req.session.room });
	}
}


exports.roomlobby = function(req,res){
	if(!req.session.user){
		res.redirect('/login');
	}else{
		res.render('roomlobby', { title: 'my chat app', user: req.session.user });
	}
}

exports.friend = function(req, res, next) {
	//TODO ここでDBからフレンドリストとランダムに五人くらいのユーザーを引っ張ってきて友達候補としてデータを渡す
	var user = req.session.user;
	if(!req.session.user){
		//loginしてなかった/loginに飛ばす
		res.redirect('/login');
	}else{
		//loginしていたら、frienddataを取得し、/friendに飛ぶ
		db.getFriend(user.name, function(err,friend){
			if(err){
				console.log(err);
				res.redirect('/login');
			}else{
				db.getRandomUserData(function(users){
					console.log('@friend users:' + users[0].name);
					res.render('friend', { title: 'my chat app', user: req.session.user, friend: friend, users: users });
				});
			}
		});
	}
};

exports.searchfriend = function(req,res,next){
	var searchResult = req.body.search;
	console.log(searchResult);
	req.session.user.friend = searchResult; 
	res.redirect('/friend');
}

//TODO friend追加処理
exports.makefriend = function(req,res,next){
	var searchResult = req.body.search;
	console.log(searchResult);
	//TODO これを/friendで拾うようにする。
	req.session.user.friend = searchResult; 
	res.redirect('/friend');
}