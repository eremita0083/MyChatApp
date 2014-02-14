exports.friend = function(req, res, next) {
	if(!req.session.user){
		res.redirect('/login');
	}else{
		res.render('friend', { title: 'my chat app', user: req.session.user });	
	}
};

exports.searchfriend = function(req,res,next){
	var searchResult = req.body.search;
	console.log(searchResult);
	//TODO これを/friendで拾うようにする。
	req.session.user.friend = searchResult; 
	res.redirect('/friend');
}