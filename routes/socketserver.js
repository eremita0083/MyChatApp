exports.connectionIo = function(server){
    var chatModel = require('../db/mydb.js');
    var io = require('socket.io').listen(server);

    io.set('blacklist',[]);
    var sanitizer = require('validator');  //xss対策 .checkで入力値検証。.sanitizeで無害化。
    console.log('@validator'+sanitizer);

    io.sockets.on('connection', function(socket) {
        console.log("connection");
        // メッセージを受けたときの処理、dbに保存。
        // 受：message:text, date:now.getTime(), name:/name 
        socket.on('message', function(data) {
            console.log("message");
            chatModel.getLoginData(socket.id,function(userData){
                var msg;
                try{
                    //sanitizerはtry catch必須　.escapeでxss対策。
                    msg = sanitizer.escape(data.message);
                }catch(e){
                    console.log(e.message);
                    io.sockets.socket(socket.id).emit('message',{eventName:'message' ,message:'メッセージが処理されませんでした', name:'Admin'});
                    return;
                }
                //メッセージが適切なものなら、保存し正しいメッセージを送る。そうでなければ、本人にのみwarning文を送る
                if(msg!=null){
                    chatModel.setContents(userData.name, msg, data.date);
                    io.sockets.emit('message',{eventName:'message' ,message:msg, name: userData.name});
                }else{
                    io.sockets.socket(socket.id).emit('message',{eventName:'message' ,message:'不適切なメッセージが送信されました', name:'Admin'});
                }
            });
        });

        // クライアントが参加したときの処理
        socket.on('ready', function(data){
            var userName = data.user;
            chatModel.setLoginData(userName,socket.id);
            console.log('ready1');
            var docs = chatModel.getAllContents(function(docs){
                for (var i = 0; i<docs.length ; ++i) {
                    if(docs[i].messageText.indexOf('@image:') >= 0){
                        io.sockets.socket(socket.id).emit('userimage', {filename:docs[i].name , filedata:docs[i].img});	
                    }else{
                        io.sockets.socket(socket.id).emit('message', {eventName:'message' ,message:docs[i].messageText, name:docs[i].name});
                    }
                }
                chatModel.getLoginData(socket.id, function(docs){
                    console.log('@socketserver '+ data.user);
                    io.sockets.emit('message',{eventName:'ready', name:data.user, message:''}); 
                });
            });
        });

        //ログアウト時の処理。
        socket.on('disconnect', function(){
            console.log('disconnect');
            chatModel.getLoginData(socket.id,function(userData){
                // ここでエラーが出てる　 socket.broadcast.emit('message',{eventName:'disconnect', name:userData.name, message:''});
                chatModel.removeLogin(socket.id);
            });
        });

        //画像をアップロードする
/*受：data.file = event.target.result;　data.name = file.name;data.type = type;　data.size = file.size;*/
        socket.on('upload', function(data){
            console.log('upload' + data.filename + ' ' + data.size);
            if(data.size <= 3000000 && (data.type.indexOf('image/png') >= 0 || data.type.indexOf('image/jpeg') >= 0)){
                chatModel.getLoginData(socket.id, function(userData){
                    io.sockets.emit('userimage', {name:userData.name, filedata:data.file});
                    chatModel.setContents(socket.id, '@image:' + data.filename ,data.file);
                });
            }else{
                io.sockets.socket(socket.id).emit('uploaderror','画像サイズまたは形式が適切ではありません。');
            }
        });

        // message受信
        socket.on('room_message', function (data) {
            console.log('@room_message');
            io.sockets.in('myroom').emit('room_message', data);
        });
        
        // 入室
        socket.on('room_join', function (data){
            socket.set('room', 'myroom');
            socket.set('name', data.user);
            console.log('@room_message room s detail:' + io.sockets.manager.rooms);
            console.log('@room_message');
            socket.join('myroom');
            io.sockets.in('myroom').emit('room_join', {user: data.user});
        });
    });
}

//TODO済 socketidとuseridをひもつけて、セッションdbに保存（）
//退席時はidをdeleteしたら良い。ログアウトと退席は別の概念。
//TODO　ABCDフレンドがいたとして、(socketsに対して)ルームに対しての送信(個別のemitを複数送るのはなし)。ルームに関連したsocketid登録者全員に送る感じ
// io.sockets.in('room').emit('event_name', data)　でroomに所属する全員に送ることができる。