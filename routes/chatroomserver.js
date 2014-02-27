/*
　以下、room chat
*/
exports.connectionRoomIo = function(server){
	var io = require('socket.io').listen(server);
	// TODO pathを獲得する
	var path = '/myroom';

	var chatroom = io.sockets.on('connection', function(socket) {

		// message受信
		socket.on('room_message', function (data) {
			console.log('@room_message');
			io.sockets.in('myroom').emit('room_message', data);
		});
		
		// 入室
		socket.on('room_join', function (data){
			socket.set('room', 'myroom');
        	socket.set('name', data.user);
			console.log(io.sockets.manager.rooms);
			console.log('@room_message');
			socket.join('myroom');
			socket.emit('room_join', {user: data.user});
		});

	});
}
// var socket = io.connect('http://localhost:3000/');
