var db = require('../db/mydb.js');
var loginName;
exports.getLoginName = function(){
	return loginName;
}
//loginに飛んできたときの処理がsaveStatusに入っている。
exports.login = function(req, res, next) {
	var saveStatus;
	if(req.session.saveStatus){
		saveStatus = req.session.saveStatus;
		delete req.session.saveStatus;
	}else{
		saveStatus = 'welcome';
	}
	res.render('login', { title: 'my chat app', status:saveStatus});
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
	var users;
	var authUsers = db.getUserData(user.name, user.pwd, function(dbusers){
	    users = dbusers;
	    var usersLength = users.length;
	    console.log('ユーザーの数：' + usersLength);
	    console.log('user name と　pwd' + users.name + ' '+ users.password);
		//ユーザ名とパスワードとが該当する人が一人もいなかったら、loginにリダイレクト。
		if(usersLength===0){
			res.render('login', { title: 'my chat app', status:'no user or id || pass wrong'});
			return;
		}else{
			//ユーザ名とパスワードとが該当する人がいた場合
			req.session.user = {
				name: user.name,
				pwd: user.pwd
			};
			loginName = user.name;
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
		var saveStatus;
		if(errStr === 'err'){
			console.log('でーた保存失敗');
			saveStatus = 'data could not be saved';
			req.session.saveStatus = saveStatus;
			res.redirect('/signup');
		}else if(errStr === 'dup'){
			console.log('でーた保存失敗');
			saveStatus = 'id or password is dupricated';
			req.session.saveStatus = saveStatus;
			res.redirect('/signup');
		}else{
			console.log('でーた保存成功');
			saveStatus = 'data is saved';
			req.session.saveStatus = saveStatus;
			res.redirect('/login');
		}
	});
};