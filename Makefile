export PORT_SOCKET=5000
export REACT_APP_SOCKET_HOST=192.168.178.76
export REACT_APP_SOCKET_PORT=${PORT_SOCKET}

debug:
	(cd server && npm run debug)& (cd client && npm run start)

release:
	(cd client && npm run build) && (cd server && node server.js)