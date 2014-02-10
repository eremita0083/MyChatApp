/*//userのダミーデータ
var users = {'a':'a' , 'b':'b' , 'c':'c'};
//連想配列の要素数の取得
var usersLength = 0;
for(var j in users){
   usersLength++;
}*/
var db = require('../db/mydb.js');

exports.login = function(req, res, next) {
	res.render('login', { title: 'my chat app', status:'init'});
};

//logoutしたらsessionの情報を削除し、loginに飛ばす
exports.logout = function(req, res, next) {
	delete req.session.user;
	res.redirect('/login');
};

exports.test = function(req, res, next) {
	//login formから得られたデータ
	var user = req.body.user;
	console.log('username：：' + user.name +' userpsw：：' + user.pwd );
	//dbからusernameを獲得
	var users;
	var authUsers = db.getUserData(user.name, user.pwd, function(dbusers){
	    users = dbusers;
	    var usersLength = users.length;
	    console.log('ユーザーの数：：' + usersLength);
	    console.log('user name と　pwd' + users.name + ' '+ users.password);
		//ユーザ名とパスワードとが該当する人が一人もいなかったら、loginにリダイレクト。
		if(usersLength===0){
			res.render('login', { title: 'my chat app', status:'no user or id||pass wrong'});
			return;
		}else{
			//いた場合
			req.session.user = {
				name: user.name,
				pwd: user.pwd
			};
			res.redirect('/chat');
		}
		
	});

};

exports.signup = function(req, res, next) {
	res.render('signup');
};

exports.signupnow = function(req, res, next) {
	var user = req.body.user;
	db.setUserData(user.name,user.pwd,function(errStr){
		console.log('setUserData済み');
		var saveStatus;
		if(errStr){
			console.log('でーた保存失敗');
			saveStatus='data could not be saved';
		}else{
			saveStatus='data is saved';
		}
		console.log('でーた保存成功');
		res.redirect('/login');
	});
};

// res.location headerへの設定のエイリアス？URLを指定し、 
// res.status これでステータスコードを指定する必要がある


//POST idとpswの正誤認証 forEach文はbreakがデフォでは使えない仕様。
		/*var i =0;
		var route = false;
		Object.keys(users).forEach(function(name) {
			i += 1;
			if (user.name === name && user.pwd === users[name]) {
				req.session.user = {
					name: user.name,
					pwd: user.pwd
				};
			route = true;
			}
			if(i===usersLength){
				switch(route){
					case false:
						console.log('idとpsw間違い');
						res.redirect('/login');
						break;
					case true:
						console.log('idとpsw正解');
						res.redirect('/chat');//ページ遷移はredirect
						//res.status('200');
						//res.location('http://localhost:3000/chat'); //　TODO locationの使い方
						break;
				}
			}
		});*/