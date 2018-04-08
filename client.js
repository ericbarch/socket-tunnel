'use strict';

module.exports = (options) => {
  // require the things we need
  const net = require('net');
  const ss = require('socket.io-stream');
  let socket = require('socket.io-client')(options['server']);

  socket.on('connect', () => {
    console.log(new Date() + ': connected');
    console.log(new Date() + ': requesting subdomain ' + options['subdomain'] + ' via ' + options['server']);

    socket.emit('createTunnel', options['subdomain']);
  });

  socket.on('incomingClient', (clientId) => {
    let client = net.connect(options['port'], options['hostname'], () => {
      let s = ss.createStream();
      s.pipe(client).pipe(s);

      s.on('end', () => {
        client.destroy();
      });

      ss(socket).emit(clientId, s);
    });

    client.on('error', () => {
      // handle connection refusal (create a stream and immediately close it)
      let s = ss.createStream();
      ss(socket).emit(clientId, s);
      s.end();
    });
  });
};
