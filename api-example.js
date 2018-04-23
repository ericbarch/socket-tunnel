const socketTunnel = require('./lib/api')

socketTunnel.connect("https://domain.example", "device", "2222",)
.then(console.log)
.catch(console.log)
