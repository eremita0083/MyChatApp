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
	   usersLength++;
	}
	forEach����break���f�t�H�ł͎g���Ȃ��d�l�B

app.js
	//session �́@cookieParser��session��app.router�̏��ԂŋL�q�B�ȉ��̂悤�Ȋ���
 	app.use(express.cookieParser('secretkey')); // �Z�b�V�����Ǘ��ɕK�{�B
	app.use(express.session());// �Z�b�V�����Ǘ��ɕK�{�B
	app.use(app.router);

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

jade�֘A
	



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


�Q�l�ɂȂ�web
// https://gist.github.com/kkurahar/555188 connectmongo ��session
// http://taro-tnk.hatenablog.com/entry/2012/12/27/130559  bootstrap
// http://kikuchy.hatenablog.com/entry/2013/07/03/042221  express + passport
	
