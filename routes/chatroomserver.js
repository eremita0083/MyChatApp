/*
　以下、room chat
*/
exports.connectionRoomIo = function(server){
	var io = require('socket.io').listen(server);

	// TODO pathを獲得する
	var path = '/myroom';
	var chatroom = io.socket.on('connection', function(socket) {
		socket.emit('connected');

		socket.on('room_message', function (data) {

		});
		
		socket.on('room_join', function(data){
			socket.set('room', req.room);
    	    socket.set('name', req.name);
    	    chatroom.to(req.room).emit('join');
			socket.join('testroom');
		});
	});
}
// var socket = io.connect('http://localhost:3000/');
