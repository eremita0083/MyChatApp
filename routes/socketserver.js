exports.connectionIo = function(server){
    var chatModel = require('../db/mydb.js');
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function(socket) {
        console.log("connection");

        // メッセージを受けたときの処理
        // message:text, date:now.getTime(), name:/* name */
        socket.on('message', function(data) {
            console.log("message");
            //dbに保存
            chatModel.setContents(data.name,data.message,{});
            // つながっているクライアント全員に送信
            io.sockets.emit('message',{eventName:'message' ,message:data.message, name:data.name});
        });

        // クライアントが参加、切断したときの処理
        // on(event名,function(){})
        // .emit,.onは対。event名を一致させないといけない。
        socket.on('ready', function(data){
            console.log('ready')
            // socket.broadcast.emit("event名","value");　これで自分以外の全員にメッセージを送ることができる。
            var docs = chatModel.getAllContents(function(docs){
                console.log('@ready');
                for (var i = 0; i<docs.length ; ++i) {
                //incexOfの戻り値はその文字列が見つかった場所の数値が返る。見つからなかった-1が返る。
                //io.sockets.socket(socket.idで特定の人へメッセージを送ることができる)
                    if(docs[i].messageText.indexOf('@image:') >= 0){
                        io.sockets.socket(socket.id).emit('userimage', docs[i].name , docs[i].img);	
                    }else{
                        io.sockets.socket(socket.id).emit('message', {eventName:'message' ,message:docs[i].messageText, name:docs[i].name});
                    }
                }
                io.sockets.emit('message',{eventName:'ready' ,name:data});
            });
        });

        //退出時、ログアウト時の処理。TODO dataからデータが取り出せない。
        socket.on('disconnect', function(data){
            console.log('disconnect');
            io.sockets.emit('message',{eventName:'disconnect',name:'disconnect'});
        });

        //画像をアップロードする
        /*data.file = event.target.result;
        data.name = file.name;
        data.type = type;
        data.size = file.size;*/
        socket.on('upload', function(data){
            console.log('upload' + data.name + ' ' + data.size);
            if(data.size <= 3000000 && (data.type.indexOf('image/png') >= 0 || data.type.indexOf('image/jpeg') >= 0)){
                io.sockets.emit('userimage', data.name, data.file);
                chatModel.setContents(socket.id, '@image:' + data.name ,data.file);
            }else{
                io.sockets.socket(socket.id).emit('uploaderror','画像サイズまたは形式が適切ではありません。');
            }
        });
    });
}