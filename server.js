var http = require("http");
var io = require('socket.io')();
var os = require('os');
var fs = require("fs");
var currentUsers = [];
var resourceToFunction = {};
var ifaces = os.networkInterfaces();

for (var a in ifaces) {
	for (var b in ifaces[a]) {
	    var addr = ifaces[a][b];
	    if (addr.family === 'IPv4' && !addr.internal) {
		console.log("Network IP: " + addr.address );
	    }
	}
}

var server = http.createServer(function(req, res) {
	var auth = req.headers['authorization'];
	if(!auth) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
		res.end('<html><body>Need some creds son</body></html>');
	} else if(auth) {
		var tmp = auth.split(' ');
		var buf = new Buffer.from(tmp[1], 'base64');
		var plain_auth = buf.toString();
		var creds = plain_auth.split(':');
		var username = creds[0];
		var password = creds[1];
		if((username == 'hack') && (password == 'theplanet')) {
			if (req.url == "/gs2w.chat") {
	      var read = fs.createReadStream(__dirname + req.url);
	      read.pipe(res);
	      res.writeHead(200, {"Content-Type": "text/html"});
	    } else if (req.url == "/style.css" || req.url == "/client.js" || req.url == "/bootstrap.min.css" || req.url == "/jquery.min.js") {
	      res.writeHead(200, {"Content-Type":
				req.url == '/style.css' ? 'text/css' : 'application/javascript'});
	      fs.createReadStream(__dirname + req.url).pipe(res);
	    } else {
				res.writeHead(400, "Invalid URL/Method");
				res.end();
	    }
		} else {
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
			res.end('<html><body>You shall not pass</body></html>');
		}
	}
});

io.sockets.on("connection", function(socket) {
    console.log("connected: " + socket.handshake.query.username);
    console.log(socket.handshake.query.username);
    currentUsers.push(socket.handshake.query.username);
    socket.on('newMessage', function(msg) {
        io.emit('newMessage', msg);
    });
});
server.listen(8000);
io.listen(server);
