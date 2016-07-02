# socket-tunnel

Tunnel HTTP Connections via socket.io streams.

## Server Usage

1. Clone this repo and cd into it
2. docker build -t socket-tunnel .
3. docker run -d -p 80:3000 --restart=always socket-tunnel
4. Get a domain name
5. Point your domain name's root A record at your server's IP
6. Point a wildcard (*) A record at your server's IP

## Client Usage

1. Clone this repo and cd into it
2. Configure REQUESTED_SUBDOMAIN and LOCAL_PORT in client.js
3. Set TUNNEL_SERVER in client.js to point to your server's domain name
4. node client.js

## Credits

Created by Eric Barch.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details