
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes/chat');
var auth = require('./routes/auth');
var http = require('http');
var path = require('path');
var socketServer = require('./routes/socketserver.js');

var app = express();

//session store
//var sessionStore = require('connect-mongo')(express);

//mangooseがmongodbを使うために必要なモジュール。使う際は予めmongoを起動させておく必要がある。
//デフォルトの待ちうけはlocalの27017。 require > schema > model の順に定義。
// session は　cookieParser→session→app.routerの順番で記述
// all environments
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

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// ルートの設定 get post del put all が使える。
//第１引数はアドレスのホスト名の後ろ、第二引数はroutes
//つまり第一引数をたたいたら、第二引数の処理が行われるということ。第三引数はnextでその処理を渡す先
app.get('/login', auth.login);
app.post('/test',auth.test);
app.get('/chat',  routes.chat);
app.del('/logout', auth.logout);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

//socketIo待ちうけ
socketServer.connectionIo(server);

// 済みTODO socket.ioで画像を送り、DBに保存する
// ステータスコード 200系成功、400系はアドレス側　500系はサーバー側のミス
// ロードバランサーがサーバにうまく振り分ける。
// nativeでクライエント側のためにAPI作るか？

// 済　TODO セッション管理。　
// パスワードをハッシュ化して保存して、DBから抜き出して認証していく。

// app.jsを肥大させたくない、サーバ部分、コントローラ部分、mongo部分、ソケット部分を分ける。
// コントローラが各部位に命令をだし、データだけ取ってくる。ルートでやる仕事をappがやっているのでリファクタリング。
// やってることと書いてることを意識、似たような機能はまとめる。フォルダの名前や変数名すべてに意味がある。
//　まとめられるものはまとめる。何回も使う処理はbaseなど命名してから使う。
//　リファクタリングをしてバグを引き起こすことがある。テストをし、動く事を担保しながらリファクタリングを行う。

// TODO　mongooseで要素のネストを読み取ってくれなかった。

//　indexが
//　ログイン判定の処理はとりあえず

// https://gist.github.com/kkurahar/555188