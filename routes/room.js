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
	res.render('room', { title: 'my chat app', user: req.session.user, room:req.session.room });
}

exports.roomlobby = function(req,res){
	res.render('roomlobby', { title: 'my chat app', user: req.session.user });
}