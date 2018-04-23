'use strict';

module.exports = (options, success = console.log, err = console.log) => {
  // require the things we need
  const net = require('net');
  const ss = require('socket.io-stream');
  let socket = require('socket.io-client')(options['server']);

  socket.on('connect', () => {
    console.log(new Date() + ': connected');
    console.log(new Date() + ': requesting subdomain ' + options['subdomain'] + ' via ' + options['server']);

    socket.emit('createTunnel', options['subdomain'], (err) => {
      if (err) {
        console.log(new Date() + ': [error] ' + err);

        // send error to callback
        err(err);
      } else {
        console.log(new Date() + ': registered with server successfully');

        // clean and concat requested url. send url success to callback
        let url = ()=>{
          let subdomain = options['subdomain'].toString()
          let server = options['server'].toString()

          if (server.includes('https://')){
            return `https://${subdomain}.${server.slice(8)}`
          } else if (server.includes('http://')){
            return `http://${subdomain}.${server.slice(7)}`
          } else {
            return `https://${subdomain}.${server}`
          }

        };

        success(url());
      };

    });
  });

  socket.on('incomingClient', (clientId) => {
    let ref;
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
