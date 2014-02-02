
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var chatModel = require('./routes/mydb.js');

var app = express();

//mangooseがmongodbを使うために必要なモジュール。使う際は予めmongoを起動させておく必要がある。
//デフォルトの待ちうけはlocalの27017。 require > schema > model の順に定義。

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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

//serverを作成しlistenした後、socket.ioをrequireしサーバにてlisten
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	console.log("connection");

	// メッセージを受けたときの処理
	socket.on('message', function(data) {
		console.log("message");
		//dbに保存
		var model = chatModel.getChatmodel();
    	var chat = new model;
    	addDataToChatModel(chat,socket.id,data.message,{});
	    //chat.saveで保存、引数はエラー時の処理の関数
	    chat.save(function(err) {
	    	if (err) { 
	    		console.log(err);
	    	}else{
	    		//var dbData = Chat.find({}, 'date img', {sort:{date:-1}, limit:1}と設定しても、imgのネストの要素が取れなかった。
	    		//sortは-1だと最新のものから表示される。1だと古いものから表示される
	    		var dbData = chatModel.getChatmodel().find({}, 'date', {sort:{date:-1}, limit:1}, function(err, docs) {
    				for (var i=0, size=docs.length; i<size; ++i) {
    					console.log(docs[i].date);
    				}
    			});
    		}
    	});
	     // つながっているクライアント全員に送信
	    io.sockets.emit('message',{eventName:'message' ,message:data.message, from:socket.id});
	});

  // クライアントが参加、切断したときの処理
  // on(event名,function(){})
  // .emit,.onは対。event名を一致させないといけない。
  	socket.on('ready', function(data){
    	console.log('ready');
    	var id = socket.id;
    	// socket.broadcast.emit("event名","value");　これで自分以外の全員にメッセージを送ることができる。
    	//DBから履歴を読み取り、送信する
    	//DBにデータがある場合には読み込み、クライアントに送信する。第一引数はクエリ。第二引数の列名は半角スペースで複数記述できる'a b c'。nullなら全列検索。
    	// 第三引数はoption、ソートやlimit。第四引数はコールバック。
    	chatModel.getChatmodel().find({},'fromId messageText date img',{sort:{date : 1}}, function(err, docs) {
    		console.log('DBから履歴読み出し中');
    		for (var i = 0; i<docs.length ; ++i) {
    			//incexOfの戻り値はその文字列が見つかった場所の数値が返る。見つからなかった-1が返る。
    			//io.sockets.socket(socket.idで特定の人へメッセージを送ることができる)
    			if(docs[i].messageText.indexOf('@image:') >= 0){
    				io.sockets.socket(socket.id).emit('userimage', docs[i].fromId , docs[i].img);	
    			}else{
    				io.sockets.socket(socket.id).emit('message', {eventName:'message' ,message:docs[i].messageText, from:docs[i].fromId});
    			}
    		}
    		io.sockets.emit('message',{eventName:'ready' ,from:id});
    	});
  	});

	//IEがうまく動かないので、readyと同じ処理を二つ書いた（これだとなぜかうまく動作する）
  	socket.on('disconnect', function(data){
    	console.log('disconnect');
    	var id = socket.id;
    	io.sockets.emit('message',{eventName:'disconnect',from:id});
  	});

  	//画像を配信する
  	socket.on('upload', function(data){
  		console.log('upload' + data.name + ' ' + data.size);
	  	if(data.size <= 3000000 && (data.type.indexOf('image/png') >= 0 || data.type.indexOf('image/jpeg') >= 0)){
	  		io.sockets.emit('userimage', socket.id, data.file);
	  		var chat = new chatModel.getChatmodel();
	  		addDataToChatModel(chat, socket.id, '@image:' + data.name ,data.file);
	  		chat.save(function(err){
	  			if(err){
	  				console.log(err);
	  			}else{
	  				var dbData = Chat.find({}, 'messageText img', {sort:{date:-1}, limit:1}, function(err, docs) {
	    				console.log('@@@保存したデータ::' + docs.messageText);
	    			});
	  			}
	  		});
  		}else{
  			io.sockets.socket(socket.id).emit('uploaderror','画像サイズまたは形式が適切ではありません。');
  		}
  	});
});

//chatの情報をcommitするための関数
function addDataToChatModel(chat, id, messageText, data){
  	chat.fromId = id;
    chat.messageText = messageText;
	chat.date = new Date().getTime();
	chat.img = data;
}

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