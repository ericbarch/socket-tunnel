// CONFIG
var REQUESTED_SUBDOMAIN = 'myname';
var TUNNEL_SERVER = 'http://mydomain.com';
var LOCAL_PORT = 80;

// require the things we need
var net = require('net');
var ss = require('socket.io-stream');
var socket = require('socket.io-client')(TUNNEL_SERVER);

socket.on('connect', function () {
  console.log(new Date() + ': connected');
  console.log(new Date() + ': requesting subdomain ' + REQUESTED_SUBDOMAIN + ' via ' + TUNNEL_SERVER);

  socket.emit('createTunnel', REQUESTED_SUBDOMAIN);
});

socket.on('incomingClient', function (clientId) {
  var client = net.connect(LOCAL_PORT, '127.0.0.1', function () {
    var s = ss.createStream();
    s.pipe(client).pipe(s);

    s.on('end', function () {
      client.destroy();
    });

    ss(socket).emit(clientId, s);
  });

  client.on('error', function () {
    // handle connection refusal
    var s = ss.createStream();
    ss(socket).emit(clientId, s);
    s.end();
  });
});
