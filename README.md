# socket-tunnel

Tunnel HTTP Connections via socket.io streams. Inspired by [localtunnel](https://github.com/localtunnel/localtunnel).

## Blog Post

http://ericbarch.com/post/143994549052/tunneling-http-connections-via-socketio-streams

## Server Usage

1. Clone this repo and cd into it
2. docker build -t socket-tunnel .
3. docker run -d -p 80:3000 --restart=always --name st-server socket-tunnel
4. Get a domain name
5. Point your domain name's root A record at your server's IP
6. Point a wildcard (*) A record at your server's IP

## Client Usage

1. Clone this repo and cd into it
2. Configure REQUESTED\_SUBDOMAIN and LOCAL\_PORT in client.js
3. Set TUNNEL\_SERVER in client.js to point to your server's domain name
4. node client.js
5. Browse to http://<REQUESTED\_SUBDOMAIN>.YOURDOMAIN.com
6. See your service running on http://127.0.0.1:<LOCAL\_PORT> available on the public internet

## TODO

Package this nicely and make it easy to use. Sorry, this was a quick reference implementation!

## Credits

Created by Eric Barch.

## License

This project is licensed under the MIT License - see the LICENSE file for details