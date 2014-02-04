var users = { 'a': 'a' , 'b':'b' , 'c': 'c'}; // ユーザデータベース

exports.login = function(req, res, next) {
	var user = req.body.user;
	if (user) {
		Object.keys(users).forEach(function(name) {
			if (user.name === name && user.pwd === users[name]) {
				req.session.user = {
					name: user.name,
					pwd: user.pwd
				};
			}
		});
	}
	next();
};

exports.logout = function(req, res, next) {
	delete req.session.user;
	next();
};

exports.index = function(req, res){
  res.render('index', { title: 'my chat app', user: req.session.user });
};

exports.about = function(req,res){
	res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});
	res.end('name: my chat app');
};