exports.chat = function(req, res){
	res.render('chat', { title: 'my chat app', user: req.session.user });
};