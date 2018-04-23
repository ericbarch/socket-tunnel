// client api

const client = require("../client")

let api = {
    connect: (server, subdomain, port, hostname = '127.0.0.1' )=>{
        return new Promise((res, rej)=>{
            if (!server || !subdomain || !port || !hostname) rej('0ne or more options were not provided');
            let options = {
                server: server,
                subdomain: subdomain.toString(),
                port: port.toString(),
                hostname: hostname
            };
            client(options, res, rej);
        })
    }
};

module.exports = api;