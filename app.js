
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var socketServer = require('./routes/socketserver.js');
var app = express();

//session store
var sessionStore = require('connect-mongo')(express);

//mangooseがmongodbを使うために必要なモジュール。使う際は予めmongoを起動させておく必要がある。
//デフォルトの待ちうけはlocalの27017。 require > schema > model の順に定義。

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.cookieParser()); // connect-mongo必須。セッションはcookieを使うので必要
app.use(express.session({
    secret: 'topsecret',
    store: new sessionStore({
        db: 'sessions', // require
        host: '127.0.0.1', // default: 127.0.0.1
        username: 'user', // optional
        password: 'pass', // optional
        clear_interval: 60 * 60 // Interval in seconds to clear expired sessions. 60 * 60 = 1 hour
    }),
    cookie: {
        httpOnly: false,
        // 60 * 60 * 1000 = 1800000 msec = 30 minute
        maxAge: new Date(Date.now() + 60 * 30 * 1000)
    }
}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// ルートの設定
app.get('/', routes.index); // route path

var server = http.createServer(app);

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

//socketIo待ちうけ
socketServer.connectionIo(server);


// 済TODO　画像をアップロードしてDBに保存、容量制限をかけること、拡張子で制限をつける（jpg,png,gif）
// ステータスコード 200系成功、400系はアドレス側　500系はサーバー側のミス
// ロードバランサーがサーバにうまく振り分ける。
// nativeでクライエント側のためにAPI作るか？

// TODO セッション。
// パスワードを保存してハッシュ化して保存して、DBから抜き出して認証していく。

// app.jsを肥大させたくない、サーバ部分、コントローラ部分、mongo部分、ソケット部分を分ける。
// コントローラが各部位に命令をだし、データだけ取ってくる。ルートでやる仕事をappがやっているのでリファクタリング。
// やってることと書いてることを意識、似たような機能はまとめる。フォルダの名前や変数名すべてに意味がある。
//　まとめられるものはまとめる。何回も使う処理はbaseなどのようにまとめてから使う。
//　リファクタリングをしてバグを引き起こす「デぐれる」。テストをし、動く事を担保しながらリファクタリングを行う。

// TODO　mongooseで要素のネストを読み取ってくれなかった。次のテーマ。