exports.connectionIo = function(server){
    var auth = require('./auth.js');
    var chatModel = require('../db/mydb.js');
    var io = require('socket.io').listen(server);
    io.set('blacklist',[]);

    io.sockets.on('connection', function(socket) {
        console.log("connection");

        // メッセージを受けたときの処理、dbに保存。
        // 受：message:text, date:now.getTime(), name:/name 
        socket.on('message', function(data) {
            console.log("message");
            chatModel.getLoginData(socket.id,function(userData){
                chatModel.setContents(userData.name, data.message, data.date);
                io.sockets.emit('message',{eventName:'message' ,message:data.message, name: userData.name});
            });
        });

        // クライアントが参加したときの処理
        socket.on('ready', function(data){
            var userName = data.user; // ここが問題。
            chatModel.setLoginData(userName,socket.id);
            console.log('ready1');
            var docs = chatModel.getAllContents(function(docs){
                console.log('ready2');
                for (var i = 0; i<docs.length ; ++i) {
                    if(docs[i].messageText.indexOf('@image:') >= 0){
                        io.sockets.socket(socket.id).emit('userimage', {filename:docs[i].name , filedata:docs[i].img});	
                    }else{
                        io.sockets.socket(socket.id).emit('message', {eventName:'message' ,message:docs[i].messageText, name:docs[i].name});
                    }
                }
                chatModel.getLoginData(socket.id, function(data){
                    io.sockets.emit('message',{eventName:'ready', name:data.name, message:''}); 
                });
            });
        });

        //ログアウト時の処理。
        socket.on('disconnect', function(){
            console.log('disconnect');
            chatModel.getLoginData(socket.id,function(userData){
                socket.broadcast.emit('message',{eventName:'disconnect', name:userData.name, message:''});
                chatModel.removeLogin(userData.name,userData.id);
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
    });
}

//TODO済 socketidとuseridをひもつけて、セッションdbに保存（）
//退席時はidをdeleteしたら良い。ログアウトと退席は別の概念。
//TODO　ABCDフレンドがいたとして、(socketsに対して)ルームに対しての送信(個別のemitを複数送るのはなし)。ルームに関連したsocketid登録者全員に送る感じ
// io.sockets.in('room').emit('event_name', data)　でroomに所属する全員に送ることができる。