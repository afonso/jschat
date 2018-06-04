const http = require("http");
const io = require('socket.io')();
const os = require('os');
const fs = require("fs");
let currentUsers = [];
let resourceToFunction = {};
const ifaces = os.networkInterfaces();

const chat = (portParam, usernameParam, passwordParam) => {
	for (let a in ifaces) {
		for (let b in ifaces[a]) {
			const addr = ifaces[a][b];
		  if (addr.family === 'IPv4' && !addr.internal) {
				console.log("Network IP: " + addr.address );
		  }
		}
	}

	const server = http.createServer(function(req, res) {
		const auth = req.headers['authorization'];
		if(!auth) {
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
			res.end('<html><body>Need some creds son</body></html>');
		} else if(auth) {
			const tmp = auth.split(' ');
			const buf = new Buffer.from(tmp[1], 'base64');
			const plain_auth = buf.toString();
			const creds = plain_auth.split(':');
			const username = creds[0];
			const password = creds[1];
			if((username === usernameParam) && (password === passwordParam)) {
				if (req.url == "/gs2w.chat") {
		      const read = fs.createReadStream(__dirname + req.url);
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
	server.listen(portParam);
	io.listen(server);
}
