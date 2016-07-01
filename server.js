// config
var SERVER_PORT = 3000;

// libs
var bouncy = require('bouncy');
var tldjs = require('tldjs');
var ss = require('socket.io-stream');
var uuid = require('node-uuid');

// association between subdomains and socket.io sockets
var socketsByName = {};

// bounce incoming http requests to socket.io
var server = bouncy(function (req, res, bounce) {
  // without a hostname, we won't know who the request is for
  var hostname = req.headers.host;
  if (!hostname) {
    res.statusCode = 502;
    return res.end('Invalid hostname');
  }

  // make sure we received a subdomain
  var subdomain = tldjs.getSubdomain(hostname);
  if (!subdomain) {
    res.statusCode = 502;
    return res.end('Invalid subdomain');
  }

  var clientId = subdomain.toLowerCase();
  var client = socketsByName[clientId];

  // no such subdomain
  // we use a 502 error to the client to signify we can't service the request
  if (!client) {
    res.statusCode = 502;
    res.end(clientId + ' is currently unregistered or offline.');
  } else {
    var requestGUID = uuid.v4();

    client.emit('incomingClient', requestGUID);

    ss(client).once(requestGUID, function (stream) {
      bounce(stream);
    });
  }
});

// socket.io instance
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  socket.on('createTunnel', function (requestedName) {
    if (socket.requestedName) {
      // tunnel has already been created
      return;
    }

    // domains are case insensitive
    var reqNameNormalized = requestedName.toLowerCase();

    // make sure the client is requesting an alphanumeric of reasonable length
    if (/[^a-zA-Z0-9]/.test(reqNameNormalized) || reqNameNormalized.length === 0 || reqNameNormalized.length > 63) {
      console.log(reqNameNormalized + ' -- bad subdomain. disconnecting client.');
      return socket.disconnect();
    }

    // make sure someone else hasn't claimed this subdomain
    if (socketsByName[reqNameNormalized]) {
      console.log(reqNameNormalized + ' requested but already claimed. disconnecting client.');
      return socket.disconnect();
    }

    // store a reference to this socket by the subdomain claimed
    socketsByName[reqNameNormalized] = socket;
    socket.requestedName = reqNameNormalized;
  });

  // when a client disconnects, we need to remove their association
  socket.on('disconnect', function () {
    if (socket.requestedName) {
      delete socketsByName[socket.requestedName];
    }
  });
});

// http server
server.listen(SERVER_PORT);

console.log(new Date() + ': socket-tunnel server started on port ' + SERVER_PORT);
