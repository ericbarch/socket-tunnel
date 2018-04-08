'use strict';

module.exports = (options) => {
  // libs
  const http = require('http');
  const tldjs = require('tldjs');
  const ss = require('socket.io-stream');
  const uuid = require('uuid/v4');

  // association between subdomains and socket.io sockets
  let socketsBySubdomain = {};

  // bounce incoming http requests to socket.io
  let server = http.createServer((req, res) => {
    // without a hostname, we won't know who the request is for
    let hostname = req.headers.host;
    if (!hostname) {
      res.statusCode = 502;
      return res.end('Invalid hostname');
    }

    // make sure we received a subdomain
    let subdomain = tldjs.getSubdomain(hostname);
    if (!subdomain) {
      res.statusCode = 502;
      return res.end('Invalid subdomain');
    }

    // tldjs library return subdomain as all subdomain path from the main domain.
    // Example:
    // 1. super.example.com = super
    // 2. my.super.example.com = my.super
    // If we are running the tunnel server on a subdomain, we must strip it from the provided hostname
    if (options.subdomain) {
      subdomain = subdomain.replace(`.${options.subdomain}`, '');
    }

    let clientId = subdomain.toLowerCase();
    let client = socketsBySubdomain[clientId];

    // no such subdomain
    // we use a 502 error to the client to signify we can't service the request
    if (!client) {
      res.statusCode = 502;
      res.end(clientId + ' is currently unregistered or offline.');
    } else {
      let requestGUID = uuid();

      client.emit('incomingClient', requestGUID);

      ss(client).once(requestGUID, (tunnelClientStream) => {
        tunnelClientStream.on('error', () => {
          req.destroy();
          tunnelClientStream.destroy();
        });

        // Pipe all data from tunnel stream to requesting connection
        tunnelClientStream.pipe(req.connection);

        let postData = [];

        // Collect data of POST/PUT request to array buffer
        req.on('data', (data) => {
          postData.push(data);
        });

        // Proxy ended GET/POST/PUT/DELETE request to tunnel stream
        req.on('end', () => {
          let messageParts = [];

          // Push request data
          messageParts.push([req.method + ' ' + req.url + ' HTTP/' + req.httpVersion]);

          // Push headers data
          for (let i = 0; i < (req.rawHeaders.length - 1); i += 2) {
            messageParts.push(req.rawHeaders[i] + ': ' + req.rawHeaders[i + 1]);
          }
          // Push delimiter
          messageParts.push('');

          // Push request body data
          messageParts.push(Buffer.concat(postData).toString());

          // Push delimiter
          messageParts.push('');

          let message = messageParts.join('\r\n');

          tunnelClientStream.write(message);
        });
      });
    }
  });

  // socket.io instance
  let io = require('socket.io')(server);
  io.on('connection', (socket) => {
    socket.on('createTunnel', (requestedName) => {
      if (socket.requestedName) {
        // tunnel has already been created
        return;
      }

      // domains are case insensitive
      let reqNameNormalized = requestedName.toLowerCase();

      // make sure the client is requesting an alphanumeric of reasonable length
      if (/[^a-zA-Z0-9]/.test(reqNameNormalized) || reqNameNormalized.length === 0 || reqNameNormalized.length > 63) {
        console.log(new Date() + ': ' + reqNameNormalized + ' -- bad subdomain. disconnecting client.');
        return socket.disconnect();
      }

      // make sure someone else hasn't claimed this subdomain
      if (socketsBySubdomain[reqNameNormalized]) {
        console.log(new Date() + ': ' + reqNameNormalized + ' requested but already claimed. disconnecting client.');
        return socket.disconnect();
      }

      // store a reference to this socket by the subdomain claimed
      socketsBySubdomain[reqNameNormalized] = socket;
      socket.requestedName = reqNameNormalized;
      console.log(new Date() + ': ' + reqNameNormalized + ' registered successfully');
    });

    // when a client disconnects, we need to remove their association
    socket.on('disconnect', () => {
      if (socket.requestedName) {
        delete socketsBySubdomain[socket.requestedName];
        console.log(new Date() + ': ' + socket.requestedName + ' unregistered');
      }
    });
  });

  // http server
  server.listen(options.port, options.hostname);

  console.log(`${new Date()}: socket-tunnel server started on ${options.hostname}:${options.port}`);
};
