client.js
	dataArea.insertBefore(child,dataArea.childNodes[0] || null); //この書き方をしないとIEにはじかれる
	var text = document.getElementById("userName").value; //ID属性を指定しているならこちらの書き方のほうが早い。
	var text = document.getElementById('text1').value; // form属性にname、フォームに属するinputにname属性を付与して.でつないでもいける。
	idとnameだとidでとる方が早い。
	var text = document.getElementById('text1').value;　//これでinput text1からテキストを取得
	 window.onbeforeunload = function (e) {
    	/*var e = e || window.event;
    	// IE Firefox など
    	if (e) {
    		socket.emit('disconnect',{eventName:'disconnect',name:document.getElementById("userName").value});
    		return;
    	}
    	// saffari 用*/
    	socket.emit('disconnect',{eventName:'disconnect', name:NS.userName});
    	/*return;*/
   	}

socketServer.js
	//indexOfの戻り値はその文字列が見つかった場所の数値が返る。見つからなかったら-1が返る。
        //io.sockets.socket(socket.idで特定の人へメッセージを送ることができる)
	  ex) io.sockets.socket(socket.id).emit('message', 'data');
        // socket.broadcast.emit("event名","value");　これで自分以外の全員にメッセージを送ることができる。
        // on(event名,function(){})
          ex) .emitと.onは対。event名を一致させないと受け手と送り手が対応できない。
        //io.sockets.emit('message',{eventName:'message' ,message:data.message, name:data.name});　つながっているクライアント全員に送信

auth.js
	var user = req.body.user; //login formのuserから得られたデータ。userの部分はformから送る際に任意に変更可。
	//連想配列の要素数の取得 .size()や.lengthなどは使えない
	var users = {'a':'a' , 'b':'b' , 'c':'c'};
	var usersLength = 0;
	for(var j in users){
	   usersLength++;
	}
	forEach文はbreakがデフォでは使えない仕様。

app.js
	//session は　cookieParser→session→app.routerの順番で記述。以下のような感じ
 	app.use(express.cookieParser('secretkey')); // セッション管理に必須。
	app.use(express.session());// セッション管理に必須。
	app.use(app.router);

        // development only　開発終了したら以下の記述は削除してもよい
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}
	
	//app.use(app.router)の後に記述する事でrouterで指定した以外のパスへのアクセスをloginへ遷移させられる
	app.use(function(req, res, next){
		if(req.path==='/'){
	    		res.redirect('/login');
		}
	});

	// ルートの設定 get post del put が使えるが、通常はget,postのみを使う。del,putはpostでdataを送信した後、expressが変換処理を行っている。
	第１引数はアドレスのホスト名の後ろの部分、第二引数はroutesの処理
	つまり第一引数のアドレスをたたいたら、第二引数の処理が行われるということ
	app.get('/login', auth.login);　これはhost/loginを叩いたら、auth.jsのexports.login = function(req,res,next){}の処理が行われるということ。
	app.post('/searchfriend', friend.searchfriend);　
	postのデータはreq.bodyから取得可能。下記の場合は、req.body.userからuser.nameとuser.pwdが取得できる。
	ex)
	form#loginForm(method='post', action='/test')
        fieldset
            legend login
            p
                label(for='user[name]') ユーザ名:
                input(name='user[name]')
            p
                label(for='user[pwd]') パスワード:
                input(type='password', name='user[pwd]')
            input(type='submit')

mydb.js
	ひとつのｄｂインスタンスに複数のコネクトを行う場合は、二つ目以降のコネクトはconect()ではなくcreateConnection()を使う。
	//chat.saveで保存、引数はエラー時の処理の関数
        //sortは-1だと最新のものから表示される。1だと古いものから表示される
	var dbData = Chat.find({}, 'date messageText img', {sort:{date:-1}, limit:1}, function(err, docs) {});
	//mangooseはmongodbを使うために必要なモジュール。app.jsをserverで走らす際は予めmongoを起動させておく必要がある。
	//デフォルトの待ちうけはlocalの27017。 require > schema > model の順に定義。mongoose.connect('mongodb://localhost:27017/~~');
	・sessionの操作
	request.session.name = 'value'; // 値の設定
	delete request.session.name; // 値の破棄
	request.session.destroy(); // セッションの破棄	
	・sessionのスキーマを作成
	var sessionSchema = mongoose.Schema({
		name:String,
		socketid:String,
		date:Date
	});
	mongoose.model('session',sessionSchema);
	mongoose.createConnection('mongodb://localhost:27017/session');　//二つ目以降のコネクション。最初ならconectでよい。
	var Session = mongoose.model('session');*/


jade関連
	



備考
　済  TODO socket.ioで画像を送り、DBに保存する
　ステータスコード 200系成功、300系リダイレクト、400系はclient側err　500系はserver側err
　大規模なアプリなどはロードバランサがサーバにうまく振り分ける。

　済　TODO セッション管理。　
　パスワードをハッシュ化して保存して、DBから抜き出して認証していく。

  済　TODO route model viewでやる仕事をappがやっているのでリファクタリング。
	// app.jsを肥大させたくない、サーバ部分、コントローラ部分、mongo部分、ソケット部分を分ける。
	// コントローラが各部位に命令をだし、データだけ取ってくる。
	// やってることと書いてることを意識、似たような機能はまとめる。フォルダの名前や変数名すべてに意味を持たせる。
	// まとめられるものはまとめる。何回も使う処理はbaseなど命名してから使う。
	// リファクタリングをしてバグを引き起こすことがある。テストをし、動く事を担保しながらリファクタリングを行う。
　//　next()はapp.jsのapp.use～の部分をひとつ下に下り読み込み実行するだけのもの
　// redirect時はsessionに値を持たせ、遷移先でsessionから消す。

　済  TODO ログイン判定の処理
　　　TODO バックボタンから遷移したらチャット機能を使えないようにする。 難しい
　済　TODO 登録ページの作成。ｄｂ見るのはログイン画面で。　
　// クロスサイトリクエストフォージェリ csrf対策をしていないwebサイトにアクセスした人を攻撃用のページに遷移させる
  済　TODO socketserverでdisconnectが渡されたdataを上手くパースしてくれない。
      →io.set('blacklist': []);でブラックリストを初期化できる。


参考になるweb
// https://gist.github.com/kkurahar/555188 connectmongo でsession
// http://taro-tnk.hatenablog.com/entry/2012/12/27/130559  bootstrap
// http://kikuchy.hatenablog.com/entry/2013/07/03/042221  express + passport
	
