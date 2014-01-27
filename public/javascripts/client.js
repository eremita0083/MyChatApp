var socket = io.connect('http://localhost:3000');

var selfId;
//UserIdを画面に表示し、参加したことを知らせる
socket.emit('ready','');

//メッセージ受け取り処理
socket.on('message', function (data) {
    console.log('message received!');
    console.log('受け取ったデータ:' + data);
    var child = document.createElement('p');
    child.innerHTML = data;
    var dataArea = document.getElementById('dataArea');
    dataArea.insertBefore(child,dataArea.childNodes[0] || null);
});

//参加受け取り。selfIdを保存
socket.on('ready', function (data) {
    console.log('ready received');
    var child = document.createElement('p');
    // !selfId ? (selfId = data) :　null ;
    if(!selfId){
    	selfId = data;
    	document.getElementById('connectId').innerHTML = 'yourID: ' + selfId;
    }
    child.innerHTML = data + 'が参加';
    child.style.color = 'red';
    var dataArea = document.getElementById('dataArea');
    dataArea.insertBefore(child,dataArea.childNodes[0] || null); //こうしないとIEではじかれる
    // document.getElementById('dataArea').appendChild(child);で末尾につく
});

//ボタンを押したらテキストをサーバーに送る処理
function writing(){
	//これでinput textからテキストを取得
	var text = document.sampleForm.textfield.value;
	// var text = document.getElementById("text1").value;

	socket.emit('message',{message:selfId+ ':' + text});
	// alert('「' + text + '」を送信しました');
	console.log('送信したデータ：' + text);
}

//退出時の処理
window.onbeforeunload = function (e) {
	var e = e || window.event;
	// IE Firefox など
	if (e) {
		socket.emit('disconnect',null);
		return;
	}
	// saffari 用
	socket.emit('disconnect',null);
	return;
};


//TODO 全体の履歴をｄｂで出す。