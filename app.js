// モジュール呼び出し
var express = require('express');
var http = require('http');
var path = require('path');
//ルート
var socketServer = require('./routes/socketserver.js');
var routes = require('./routes/chat');
var auth = require('./routes/auth');
var friend = require('./routes/friend');

var app = express();

// アプリケーションの設定
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('cimagel')); // セッション管理に必須。
app.use(express.session());// セッション管理に必須。
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//"/"を叩くと"/login"にリダイレクト
app.use(function(req, res, next){
	if(req.path==='/'){
	    res.redirect('/login');
	}
});

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

//route
app.get('/login', auth.login);
app.get('/signup',auth.signup);
app.get('/friend', friend.friend);
app.post('/searchfriend', friend.searchfriend);
app.post('/signupnow',auth.signupnow);
app.post('/test',auth.test);
app.get('/chat',  routes.chat);
// app.del('/logout', auth.logout);
app.post('/logout', auth.logout);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

//socketIo待ちうけ
socketServer.connectionIo(server);

// TODO　友達、ルーム。発言をユーザー情報を保持しておく。リアルタイムでログイン状態が見れる。　次
// TODO　mongooseで要素のネストを読み取ってくれなかった。
// TODO socketserverでdisconnectが渡されたdataを上手くパースしてくれない。