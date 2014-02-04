exports.connectionIo = function(server){
    var chatModel = require('../db/mydb.js');
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function(socket) {
        console.log("connection");
        // メッセージを受けたときの処理
        socket.on('message', function(data) {
            console.log("message");
            //dbに保存
            chatModel.setContents(socket.id,data.message,{});
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
            var docs = chatModel.getAllContents(function(docs){
                console.log('@ready' + docs.fromId);
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

        //画像をアップロードする
        socket.on('upload', function(data){
            console.log('upload' + data.name + ' ' + data.size);
            if(data.size <= 3000000 && (data.type.indexOf('image/png') >= 0 || data.type.indexOf('image/jpeg') >= 0)){
                io.sockets.emit('userimage', socket.id, data.file);
                chatModel.setContents(socket.id, '@image:' + data.name ,data.file);
            }else{
                io.sockets.socket(socket.id).emit('uploaderror','画像サイズまたは形式が適切ではありません。');
            }
        });
    });
}