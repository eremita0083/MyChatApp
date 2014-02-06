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
	//POST idとpswの正誤認証
	Object.keys(users).forEach(function(name) {
		if (user.name === name && user.pwd === users[name]) {
			console.log('idとpsw正解');
			req.session.user = {
				name: user.name,
				pwd: user.pwd
			};
			// res.redirect('/chat');
			res.render('chat', { title: 'my chat app', user: req.session.user });
		}
		/*i += 1;
		if(i == usersLength){
			console.log('idとpsw間違い');
			res.redirect('/login');
		}*/
	});
	
};