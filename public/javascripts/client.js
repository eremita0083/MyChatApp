var socket = io.connect('http://localhost:3000');
var NS = {};
//TODO ここにreq.session.user.nameを入れる

/*
var : userName
function: receivedAction,
*/

//　ほかの人が退出しているのに、自分が退出した出力になる。case readyの部分で上書きされている。
//　メッセージ受け取り、参加、退出のルーティング処理とdataareaへの追加処理
NS.receivedAction = function(eventName,message,name){
    var child = document.createElement('p');
    var dataArea = document.getElementById('dataArea');
    switch(eventName){
        case 'message':
        child.innerHTML = name + ': ' + message;
        break;
        case 'disconnect':
        child.innerHTML = name + 'が退出しました';
        child.style.color = 'blue';
        break;
        case 'ready':
        if(!NS.userName){
            NS.userName = name;
        }
        child.innerHTML = name + 'が参加しました';
        child.style.color = 'red';
        break;
    }
    dataArea.insertBefore(child,dataArea.childNodes[0] || null);
}

//ボタンを押したらテキストをサーバーに送る処理
function sendTextToServer(){
    var text = document.getElementById('text1').value;
    var now = new Date();
    console.log(now.getTime());
    socket.emit('message',{ message:text, date:now.getTime(), name:NS.userName});
    console.log('送信したデータ：' + text);
}

//イメージの送信
function sendImgToServer(event){
    var file = document.sampleForm.fileSelector.files[0] || document.sampleForm.fileSelector.file;
    var fileName = file.name;
    var type = file.type;
    console.log(fileName);
    var data = {};
    var reader = new FileReader();
    reader.onload = function(event) {
        data.file = event.target.result;
        data.filename = file.name;
        data.type = type;
        data.size = file.size;
        data.name = NS.userName;
        socket.emit('upload', data);
        console.log('size'+ data.size + ' type' + data.type);
    }
    reader.readAsDataURL(file);
}

//メッセージ受け取り処理
socket.on('message', function (data) {
    console.log('message received!');
    var mes = data.message;
    var name = data.name;
    var eName = data.eventName;
    console.log('イベント名:' + eName);
    console.log('メッセージ:' + mes);
    console.log('name:' + name);
    NS.receivedAction(eName,mes,name);
});

//UserIdを画面に表示し、参加したことを知らせる
socket.emit('ready');

//ボタンを押すことでデータベースの履歴を削除する TODO 未実装
function removeAllHistory(){
	alert('removing');
}

//退出時の処理
//TODO nameを拾いきれない　window.onbeforeunloadが呼ばれた時点で、sessionが切れる様子。
var onLogout = function(){
    socket.emit('disconnect',{name:NS.userName});
}

//イメージの受け取り
socket.on('userimage', function(file){
    console.log('@userimage ' + file.name);
    var child = document.createElement('img');
    child.src = file.filedata;
    child.alt = 'img';
    child.width = 100;
    child.height = 100;
    var buff = document.createElement('p');
    buff.insertBefore(child, buff.childNodes[0] || null);
    var dataArea = document.getElementById('dataArea');
    dataArea.insertBefore(buff, dataArea.childNodes[0] || null);
});

//imgのアップロードのエラー受け取り
socket.on('uploaderror',function(message){
    window.alert(message);
});