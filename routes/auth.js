//userのダミーデータ
var users = {'a':'a' , 'b':'b' , 'c':'c'};
//連想配列の要素数の取得
var usersLength = 0;
for(var j in users){
   usersLength++;
}

exports.login = function(req, res, next) {
	res.render('login', { title: 'my chat app', status:'init'});
};

//logoutしたらsessionの情報を削除し、loginに飛ばす
exports.logout = function(req, res, next) {
	delete req.session.user;
	res.redirect('/login');
};

exports.test = function(req, res, next) {
	var user = req.body.user;
	console.log('username：：' + user.name +'userpsw：：' + user.pwd );
	console.log('ユーザーの数：：' + usersLength);
	var i =0;
	var route = false;
	//POST idとpswの正誤認証 forEach文はbreakがデフォでは使えない仕様。
	Object.keys(users).forEach(function(name) {
		i += 1;
		if (user.name === name && user.pwd === users[name]) {
			req.session.user = {
				name: user.name,
				pwd: user.pwd
			};
			route = true
		}
		if(i===usersLength){
			switch(route){
				case false:
					console.log('idとpsw間違い');
					res.redirect('/login');
					break;
				case true:
					console.log('idとpsw正解');
					// res.redirect('/chat');//ページ遷移はredirect
					res.status('200');
					res.location('http://localhost:3000/chat'); //　TODO locationの使い方
					break;
			}
		}
	});
};

// res.location headerへの設定のエイリアス？URLを指定し、 
// res.status これでステータスコードを指定する必要がある