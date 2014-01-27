var socket = io.connect('http://localhost:3000');

var NS = {};
/*
variant: selfId,
function: receivedAction,
*/

//メッセージ受け取り、参加、退出のルーティング処理と追加処理
NS.receivedAction = function(eventName,message,from){
	var child = document.createElement('p');
    var dataArea = document.getElementById('dataArea');
    switch(eventName){
    	case 'message':
    	child.innerHTML = from + ': ' + message;
    	break;
    	case 'disconnect':
    	child.innerHTML = from + 'が退出しました';
    	child.style.color = 'blue';
    	break;
    	case 'ready':
    	if(!NS.selfId){
    		NS.selfId = from;
    		document.getElementById('connectId').innerHTML = 'yourID: ' + NS.selfId;
    	}
    	child.innerHTML = from + 'が参加しました';
    	child.style.color = 'red';
    	break;
    }
    dataArea.insertBefore(child,dataArea.childNodes[0] || null); //この書き方をしないとIEにはじかれる
}

//メッセージ受け取り処理
socket.on('message', function (data) {
    console.log('message received!');
    var mes = data.message;
    var from = data.from;
    var eName = data.eventName;
    console.log('イベント名:' + eName);
    console.log('メッセージ:' + mes);
    console.log('id:' + from);
    NS.receivedAction(eName,mes,from);
});

//UserIdを画面に表示し、参加したことを知らせる
socket.emit('ready','ready');

//ボタンを押したらテキストをサーバーに送る処理
function writing(){
	//これでinput textからテキストを取得
	var text = document.sampleForm.textfield.value; // form属性にname、フォームに属するinputにname属性を付与するとこのように使える。ハイフンは入れない
	// var text = document.getElementById("text1").value; //ID属性を指定していたならこちらでもよい。
	socket.emit('message',text);
	// alert('「' + text + '」を送信しました');
	console.log('送信したデータ：' + text);
}

//退出時の処理
window.onbeforeunload = function (e) {
	var e = e || window.event;
	// IE Firefox など
	if (e) {
		socket.emit('disconnect','disconnect');
		return;
	}
	// saffari 用
	socket.emit('disconnect','disconnect');
	return;
}

//TODO 全体の履歴をｄｂで出す。