exports.connectionIo = function(server){
    var auth = require('./auth.js');
    var chatModel = require('../db/mydb.js');
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function(socket) {
        console.log("connection");

        // メッセージを受けたときの処理dbに保存。
        // 受：message:text, date:now.getTime(), name:/name 
        socket.on('message', function(data) {
            console.log("message");
            chatModel.setContents(data.name,data.message,data.date);
            io.sockets.emit('message',{eventName:'message' ,message:data.message, name:data.name});
        });

        // クライアントが参加したときの処理
        socket.on('ready', function(){
            userName = auth.getUserName();
            console.log('ready');
            var docs = chatModel.getAllContents(function(docs){
                console.log('@ready');
                for (var i = 0; i<docs.length ; ++i) {
                    if(docs[i].messageText.indexOf('@image:') >= 0){
                        io.sockets.socket(socket.id).emit('userimage', {filename:docs[i].name , filedata:docs[i].img});	
                    }else{
                        io.sockets.socket(socket.id).emit('message', {eventName:'message' ,message:docs[i].messageText, name:docs[i].name});
                    }
                }
                io.sockets.emit('message',{eventName:'ready', name:userName, message:''});
            });
        });

        //ログアウト時の処理。
        socket.on('disconnect', function(data){
            console.log('disconnect');
            socket.broadcast.emit('message',{eventName:'disconnect', name:data.name, message:''});
            auth.logout();
        });

        //画像をアップロードする
/*受：data.file = event.target.result;　data.name = file.name;data.type = type;　data.size = file.size;*/
        socket.on('upload', function(data){
            console.log('upload' + data.name + ' ' + data.size);
            if(data.size <= 3000000 && (data.type.indexOf('image/png') >= 0 || data.type.indexOf('image/jpeg') >= 0)){
                io.sockets.emit('userimage', {name:data.name, filedata:data.file});
                chatModel.setContents(socket.id, '@image:' + data.name ,data.file);
            }else{
                io.sockets.socket(socket.id).emit('uploaderror','画像サイズまたは形式が適切ではありません。');
            }
        });
    });
}