// client api

const client = require("../client")

let api = {
    connect: (server, subdomain, port, hostname = '127.0.0.1' )=>{
        let options = {
            server: server,
            subdomain: subdomain,
            port: port,
            hostname: hostname
        };
        return new Promise((res, rej)=>{
            client(options, res, rej)
        })
    }
};

module.exports = api;