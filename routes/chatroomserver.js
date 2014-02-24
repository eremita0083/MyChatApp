/*
　以下、room chat
*/
var socket = io.connect('http://localhost:3000/' + room);

$(function(){
    NS.userName = $('#userName').text();
    //UserIdを画面に表示し、参加したことを知らせる
    console.log('@client ' + NS.userName);
    socket.emit('ready', {
        user: NS.userName
    });
});
/*