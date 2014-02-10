// モジュール呼び出し
var express = require('express');
var routes = require('./routes/chat');
var auth = require('./routes/auth');
var http = require('http');
var path = require('path');
var socketServer = require('./routes/socketserver.js');

var app = express();

// session は　cookieParser→session→app.routerの順番で記述
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

//routerの後ろに書くことでrouterで指定した以外のlocationへのアクセスをloginへ遷移するようにできる
app.use(function(req, res, next){
    res.redirect('/login');
});

// development only　開発終了したら削除してもよい
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// ルートの設定 get post del put が使えるが、通常はget,postのみを使う。
//第１引数はアドレスのホスト名の後ろ、第二引数はroutes
//つまり第一引数をたたいたら、第二引数の処理が行われるということ。第三引数はnextでその処理を渡す先
app.get('/login', auth.login);
app.get('/signup',auth.signup);
app.post('/signupnow',auth.signupnow);
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
// ステータスコード 200系成功、300系リダイレクト、400系はclient側err　500系はserver側err
// 大規模なアプリなどはロードバランサがサーバにうまく振り分ける。

// 済　TODO セッション管理。　
// パスワードをハッシュ化して保存して、DBから抜き出して認証していく。

// app.jsを肥大させたくない、サーバ部分、コントローラ部分、mongo部分、ソケット部分を分ける。
// コントローラが各部位に命令をだし、データだけ取ってくる。
// 済　TODO route model viewでやる仕事をappがやっているのでリファクタリング。
// やってることと書いてることを意識、似たような機能はまとめる。フォルダの名前や変数名すべてに意味がある。
//　まとめられるものはまとめる。何回も使う処理はbaseなど命名してから使う。
//　リファクタリングをしてバグを引き起こすことがある。テストをし、動く事を担保しながらリファクタリングを行う。

// TODO　mongooseで要素のネストを読み取ってくれなかった。


//　済 TODO　ログイン判定の処理
//　TODO chatページを見れないようにしたい。これは仕様。チャット機能をできないようにする。
// TODO 登録ページの作成。connect-mongo。ｄｂ見るのはログイン画面で。
// TODO　友達、ルーム。発言をユーザー情報を保持しておく。リアルタイムでログイン状態が見れる。
// csrf csrf対策をしていないwebサイトにアクセスした人を攻撃用のページに遷移させる

// https://gist.github.com/kkurahar/555188
// http://taro-tnk.hatenablog.com/entry/2012/12/27/130559