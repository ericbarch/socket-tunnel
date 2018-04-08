# socket-tunnel

Tunnel HTTP Connections via socket.io streams. Inspired by [localtunnel](https://github.com/localtunnel/localtunnel).

## Blog Post

http://ericbarch.com/post/143994549052/tunneling-http-connections-via-socketio-streams

## Server Usage

1. Clone this repo and cd into it
2. docker build -t socket-tunnel .
3. docker run -d -p 80:3000 --restart=always --name st-server socket-tunnel
4. Get a domain name (i.e. YOURDOMAIN.com)
5. Point your domain name's root A record at your server's IP
6. Point a wildcard (*) A record at your server's IP

## Client Usage

1. Start your http server that you'd like to expose to the public web (in this example we'll assume it's listening on 127.0.0.1:8000)
2. Clone this repo and cd into it
3. `npm i`
4. `node bin/client --server http://YOURDOMAIN.com --subdomain YOURSUBDOMAIN --hostname 127.0.0.1 --port 8000`
5. Browse to http://YOURSUBDOMAIN.YOURDOMAIN.com to see your local service available on the public internet

## Credits

Created by Eric Barch.

## License

This project is licensed under the MIT License - see the LICENSE file for details
