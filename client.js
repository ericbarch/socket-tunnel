module.exports = function (options) {
    // require the things we need
    var net = require('net');
    var ss = require('socket.io-stream');
    var socket = require('socket.io-client')(options['server']);

    socket.on('connect', function () {
        console.log(new Date() + ': connected');
        console.log(new Date() + ': requesting subdomain ' + options['subdomain'] + ' via ' + options['server']);

        socket.emit('createTunnel', options['subdomain']);
    });

    socket.on('incomingClient', function (clientId) {
        var client = net.connect(options['port'], options['hostname'], function () {
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
};
