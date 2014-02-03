
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'chat' });
};

exports.add = function(req, res) {
	res.render('login', { title: 'chat' });
};
