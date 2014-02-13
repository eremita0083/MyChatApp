var socket = io.connect('http://localhost:3000');
var NS = {};
/*
function: receivedAction,
*/

//メッセージ受け取り、参加、退出のルーティング処理とdataareaへの追加処理
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
    	child.innerHTML = name + 'が参加しました';
    	child.style.color = 'red';
    	break;
    }
    dataArea.insertBefore(child,dataArea.childNodes[0] || null); //この書き方をしないとIEにはじかれる
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
socket.emit('ready',document.getElementById('userName'));
//TODO
/*document.getElementById('userName').value　これでinputからuserNameを取得できる
*/

//idとnameだとidでとる方が早い。
//ボタンを押したらテキストをサーバーに送る処理
function sendTextToServer(){
	//これでinput textからテキストを取得
	var text = document.getElementById('text1').value; // form属性にname、フォームに属するinputにname属性を付与するとこのように使える。ハイフンは入れない
	// var text = document.getElementById("userName").value; //ID属性を指定していたならこちらでもよい。
	var userName = document.getElementById('userName').value;
    var now = new Date();
    console.log(now.getTime());
    //TODO dummydata あとでuserNameに置き換えたいが、なぜかuserNamwのvalueが取れない。
	socket.emit('message',{ message:text, date:now.getTime(), name:'aaa'});
	console.log('送信したデータ：' + text);
}

//ボタンを押すことでデータベースの履歴を削除する TODO 未実装
function removeAllHistory(){
	window.alert('removing');
}

//退出時の処理　TODO　ここだけで退出を確認するのはよくない。logoutを押したタイミングも加える
window.onbeforeunload = function (e) {
	/*var e = e || window.event;
	// IE Firefox など
	if (e) {
		socket.emit('disconnect',{eventName:'disconnect',name:document.getElementById("userName").value});
		return;
	}
	// saffari 用*/
	socket.emit('disconnect',{eventName:'disconnect', name:document.getElementById('userName').value});
	/*return;*/
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
        data.name = document.getElementById('userName').value;
        socket.emit('upload', data);
        console.log('size'+ data.size + ' type' + data.type);
    }
    reader.readAsDataURL(file);
}

//イメージの受け取り
socket.on('userimage', function(name, data){
    console.log('@userimage ' + name + " " + data);
    var child = document.createElement('img');
    child.src = data;
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