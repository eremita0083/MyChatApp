var socket = io.connect('http://localhost:3000/myroom');
var NS = {};

$(function(){
    NS.userName = $('#roomUserName').text();
    //UserIdを画面に表示し、参加したことを知らせる
    console.log('@client ' + NS.userName);
    // room入室時にemit。 
    socket.emit('room_join', {user: NS.userName});
});

//message nameのみ受け取る
socket.on('room_message', function (data) {
	console.log('room_message received!');
    var mes = data.message;
    var name = data.name;
    var child = document.createElement('p');
    var dataArea = document.getElementById('roomDataArea');
    child.innerHTML = name + ': ' + message;
    dataArea.insertBefore(child,dataArea.childNodes[0] || null);
});

//ボタンを押したらテキストをサーバーに送る処理
function sendTextToRoomServer(){
    var text = document.getElementById('roomtext').value;
    var now = new Date();
    console.log('@sendTextToRoomServer');
    socket.emit('room_message',{ message:text, date:now.getTime()});
}

// nameのみ受け取る。
socket.on('room_Join', function　(data){
	var mes = data.message;
    var name = data.name;
    var child = document.createElement('p');
    var dataArea = document.getElementById('roomDataArea');
    child.innerHTML = name + 'さんが入室しました';
    child.style.color = 'red'; 
    dataArea.insertBefore(child,dataArea.childNodes[0] || null);
});

