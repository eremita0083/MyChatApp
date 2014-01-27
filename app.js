
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

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

//mangooseがmongodbを使うために必要なモジュール。使う際は予めmongoを起動させておく必要がある。
//デフォルトの待ちうけはlocalの27017
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/memo');

//memoTextのスキーマを作成。テストではメモのみ
var memoTextSchema = mongoose.Schema({
	// number : Number,
	memo : String //,
	// date : Date
});

var memoTextModel = db.model('memo',memoTextSchema);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//serverを作成しlistenした後、socket.ioをrequireしサーバにて更にlisten
var io = require('socket.io').listen(server);

//TODO　以下調整必要　
io.sockets.on('connection', function(socket) {
  console.log("connection");
  
  // メッセージを受けたときの処理
  socket.on('message', function(data) {
    // つながっているクライアント全員に送信
    console.log("message");
    io.sockets.emit('message',data.message);
  });

  // クライアントが切断したときの処理
  socket.on('disconnect', function(data){
    console.log("disconnect");
    io.sockets.emit('message',socket.id + "が退出しました");
  });

  //クライアントが参加したときの処理,on(event名,function(){})
  // emit,onは対。event名を一致させないといけない。
  socket.on('ready', function(data){
    console.log('ready');
    var id = socket.id
    io.sockets.emit('ready',id);
  });

});
