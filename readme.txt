client.js
	dataArea.insertBefore(child,dataArea.childNodes[0] || null); //���̏����������Ȃ���IE�ɂ͂������
	var text = document.getElementById("userName").value; //ID�������w�肵�Ă���Ȃ炱����̏������̂ق��������B
	var text = document.getElementById('text1').value; // form������name�A�t�H�[���ɑ�����input��name������t�^����.�łȂ��ł�������B
	id��name����id�łƂ���������B
	var text = document.getElementById('text1').value;�@//�����input text1����e�L�X�g���擾
	 window.onbeforeunload = function (e) {
    	/*var e = e || window.event;
    	// IE Firefox �Ȃ�
    	if (e) {
    		socket.emit('disconnect',{eventName:'disconnect',name:document.getElementById("userName").value});
    		return;
    	}
    	// saffari �p*/
    	socket.emit('disconnect',{eventName:'disconnect', name:NS.userName});
    	/*return;*/
   	}

socketServer.js
	//indexOf�̖߂�l�͂��̕����񂪌��������ꏊ�̐��l���Ԃ�B������Ȃ�������-1���Ԃ�B
        //io.sockets.socket(socket.id�œ���̐l�փ��b�Z�[�W�𑗂邱�Ƃ��ł���)
	  ex) io.sockets.socket(socket.id).emit('message', 'data');
        // socket.broadcast.emit("event��","value");�@����Ŏ����ȊO�̑S���Ƀ��b�Z�[�W�𑗂邱�Ƃ��ł���B
        // on(event��,function(){})
          ex) .emit��.on�͑΁Bevent������v�����Ȃ��Ǝ󂯎�Ƒ���肪�Ή��ł��Ȃ��B
        //io.sockets.emit('message',{eventName:'message' ,message:data.message, name:data.name});�@�Ȃ����Ă���N���C�A���g�S���ɑ��M

auth.js
	var user = req.body.user; //login form��user���瓾��ꂽ�f�[�^�Buser�̕�����form���瑗��ۂɔC�ӂɕύX�B
	//�A�z�z��̗v�f���̎擾 .size()��.length�Ȃǂ͎g���Ȃ�
	var users = {'a':'a' , 'b':'b' , 'c':'c'};
	var usersLength = 0;
	for(var j in users){
	   resultsLength +=1;
	}
	forEach����break���f�t�H�ł͎g���Ȃ��d�l�B

app.js
	//session �́@cookieParser��session��app.router�̏��ԂŋL�q�B�ȉ��̂悤�Ȋ���
 	app.use(express.cookieParser('secretkey')); // �Z�b�V�����Ǘ��ɕK�{�B
	app.use(express.session());// �Z�b�V�����Ǘ��ɕK�{�Bdefault��memory store�𗘗p����Ȃ炱�̐ݒ�ŁB
	app.use(app.router);

	connect-mongo�Ȃǂ𗘗p����Ȃ�Apackage.json��ύX��npm install��connect-mongo��DL���A
	�ȉ��̂悤�ɋL�q�Bsecret��db�͔C�ӂ̖��O�ł������A�킩��₷�����O���悢�B
	cookie��httpOnly:false��maxAge(�^�C���A�E�g�܂ł̎���)���w�肷��B
	app.use(express.session({
    		secret: 'secret-key',
    		store: new mongoStore({
     		db:'session'     	
    		}),
    		cookie: {
        		httpOnly: false,
        		maxAge: new Date(Date.now() + 60 * 60 * 1000)
    		}
	}));

        // development only�@�J���I��������ȉ��̋L�q�͍폜���Ă��悢
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}
	
	//app.use(app.router)�̌�ɋL�q���鎖��router�Ŏw�肵���ȊO�̃p�X�ւ̃A�N�Z�X��login�֑J�ڂ�������
	app.use(function(req, res, next){
		if(req.path==='/'){
	    		res.redirect('/login');
		}
	});

	// ���[�g�̐ݒ� get post del put ���g���邪�A�ʏ��get,post�݂̂��g���Bdel,put��post��data�𑗐M������Aexpress���ϊ��������s���Ă���B
	��P�����̓A�h���X�̃z�X�g���̌��̕����A��������routes�̏���
	�܂�������̃A�h���X������������A�������̏������s����Ƃ�������
	app.get('/login', auth.login);�@�����host/login��@������Aauth.js��exports.login = function(req,res,next){}�̏������s����Ƃ������ƁB
	app.post('/searchfriend', friend.searchfriend);�@
	post�̃f�[�^��req.body����擾�\�B���L�̏ꍇ�́Areq.body.user����user.name��user.pwd���擾�ł���B
	ex)
	form#loginForm(method='post', action='/test')
        fieldset
            legend login
            p
                label(for='user[name]') ���[�U��:
                input(name='user[name]')
            p
                label(for='user[pwd]') �p�X���[�h:
                input(type='password', name='user[pwd]')
            input(type='submit')

mydb.js
	�ЂƂ̂����C���X�^���X�ɕ����̃R�l�N�g���s���ꍇ�́A��ڈȍ~�̃R�l�N�g��conect()�ł͂Ȃ�createConnection()���g���B
	//chat.save�ŕۑ��A�����̓G���[���̏����̊֐�
        //sort��-1���ƍŐV�̂��̂���\�������B1���ƌÂ����̂���\�������
	var dbData = Chat.find({}, 'date messageText img', {sort:{date:-1}, limit:1}, function(err, docs) {});
	//mangoose��mongodb���g�����߂ɕK�v�ȃ��W���[���Bapp.js��server�ő��炷�ۂ͗\��mongo���N�������Ă����K�v������B
	//�f�t�H���g�̑҂�������local��27017�B require > schema > model �̏��ɒ�`�Bmongoose.connect('mongodb://localhost:27017/~~');
	�Esession�̑���
	request.session.name = 'value'; // �l�̐ݒ�
	delete request.session.name; // �l�̔j��
	request.session.destroy(); // �Z�b�V�����̔j��	
	�Esession�̃X�L�[�}���쐬
	var sessionSchema = mongoose.Schema({
		name:String,
		socketid:String,
		date:Date
	});
	mongoose.model('session',sessionSchema);
	mongoose.createConnection('mongodb://localhost:27017/session');�@//��ڈȍ~�̃R�l�N�V�����B�ŏ��Ȃ�conect�ł悢�B
	var Session = mongoose.model('session');*/
        // update���͂���Ȋ����Bupsert��t or f�Ŏw��At�Ȃ炻��userdata���Ȃ������ꍇ�ɐV�K�쐬����Bmulti��true�Ȃ�Y���f�[�^��S�X�V����B
	User.update({ name: username }, { $set: {socketId: id} },{ upsert: false, multi: false }, function(err){
		if(err){
			console.log(err);
		}else{
			console.log('user:' + username + ' socketId:'+id);
		}
        }
	//remove���͂���Ȋ����B
	db.user.remove( { 'name.first' : /^G/ } ) //���K�\���Bname.first��G�Ŏn�܂�l�S����document���폜
	db.user.remove( { age: { $gt: 20 } } ) // $gt��greater than�i~���傫���j, $lt��lesser than�i��菬�����j�̃f�[�^��S�폜
	
	//��{�I��database��server�Ԃ̏��̓n�����́Amap object�œn���悤�ɂ���B


jade,css�֘A
	body �̃g�b�v�^�O�Ɂ@div(align='center')�@���w�肷��Ǝq�v�f�𒆉��ɔz�u�ł���
	���邢�́Acss��top��div�^�O��margin:0 auto 0 auto;���w�肷��
	y���̒����Ȃ�Acss��html�^�O�Ɂ@display:table ���w�肵�A
	http://htdsn.com/blog/archives/css-center-position.html
	



���l
�@��  TODO socket.io�ŉ摜�𑗂�ADB�ɕۑ�����
�@�X�e�[�^�X�R�[�h 200�n�����A300�n���_�C���N�g�A400�n��client��err�@500�n��server��err
�@��K�͂ȃA�v���Ȃǂ̓��[�h�o�����T���T�[�o�ɂ��܂��U�蕪����B

�@�ρ@TODO �Z�b�V�����Ǘ��B�@
�@�p�X���[�h���n�b�V�������ĕۑ����āADB���甲���o���ĔF�؂��Ă����B

  �ρ@TODO route model view�ł��d����app������Ă���̂Ń��t�@�N�^�����O�B
	// app.js���傳�������Ȃ��A�T�[�o�����A�R���g���[�������Amongo�����A�\�P�b�g�����𕪂���B
	// �R���g���[�����e���ʂɖ��߂������A�f�[�^��������Ă���B
	// ����Ă邱�ƂƏ����Ă邱�Ƃ��ӎ��A�����悤�ȋ@�\�͂܂Ƃ߂�B�t�H���_�̖��O��ϐ������ׂĂɈӖ�����������B
	// �܂Ƃ߂�����̂͂܂Ƃ߂�B������g��������base�Ȃǖ������Ă���g���B
	// ���t�@�N�^�����O�����ăo�O�������N�������Ƃ�����B�e�X�g�����A��������S�ۂ��Ȃ��烊�t�@�N�^�����O���s���B
�@//�@next()��app.js��app.use�`�̕������ЂƂ��ɉ���ǂݍ��ݎ��s���邾���̂���
�@// redirect����session�ɒl���������A�J�ڐ��session��������B

�@��  TODO ���O�C������̏���
�@�@�@TODO �o�b�N�{�^������J�ڂ�����`���b�g�@�\���g���Ȃ��悤�ɂ���B ���
�@�ρ@TODO �o�^�y�[�W�̍쐬�B��������̂̓��O�C����ʂŁB�@
�@// �N���X�T�C�g���N�G�X�g�t�H�[�W�F�� csrf�΍�����Ă��Ȃ�web�T�C�g�ɃA�N�Z�X�����l���U���p�̃y�[�W�ɑJ�ڂ�����
  �ρ@TODO socketserver��disconnect���n���ꂽdata����肭�p�[�X���Ă���Ȃ��B
      ��io.set('blacklist': []);�Ńu���b�N���X�g���������ł���B
//�C���^�[�l�b�g�Ŋm�F����module�̎g�����́Aversion up�ȂǂňقȂ��Ă���\���������B
�@�@���������āA���ۂɎg���Ƃ��͕K������document���m�F����悤�ɂ���B

�E�Z�L�����e�B�΍�
�@�P�Axss�C�@npm install validator
�@�@�@�@var sanitize = require('validator');
    ��xss�΍� .check()�œ��͒l���؁B.sanitize�Ŗ��Q���B
    �@���[�U�����͂������Q���������ϐ�msg��
    �@msg = sanitize(msg).entityEncode();�Ȃǂ̂悤�ɂ��邾���B
     .ifNull(replace): //null�Ȃ�replace�ɒu��������
     .toInt() //int��
     .toFloat() // float��
     �@sanitizer.escape(data.message); //����ŊȒP�ɖ��Q��
�@�Q�ACtrl+Shift+N�ŃV�[�N���b�g�E�B���h�E���[�h�i�N�����j

�Q�l�ɂȂ�web
// https://gist.github.com/kkurahar/555188 connectmongo ��session
// http://taro-tnk.hatenablog.com/entry/2012/12/27/130559  bootstrap
// http://www.find-job.net/startup/twitter-bootstrap-3
// http://kikuchy.hatenablog.com/entry/2013/07/03/042221  express + passport
// http://www.paperboy.co.jp/recruit/

	
express�J���̖{
Advanced Express Web Application Development �m��


		table#friendTable(border-width='2', border='#ccc')
			tr
				th.col1(colspan='3')
					div.tableHead(align='center')
						span room lobby
				th.col2(colspan='1')
					div.tableHead(align='center')
						span friend list
			tr
				td.col1(colspan='3',height='300px',margin='2')
					div#roomlobby(align='center')
				td.col2(colspan='1',height='300px',margin='2')
					div#friendlist(align='center')

			div.row
				div.col-md-8.col-sm-2(align='center')
					span room lobby
				div.col-md-4.col-sm-2(align='center')
					span friend list
			div.row
				div.col-md-8.col-sm-10(align='center')
					span room lobby
				div.col-md-4.col-sm-10(align='center')
					span room lobby