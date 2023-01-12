PORT ?= 5000
HOST ?= 192.168.178.76

debug:
	(cd server && npm run debug)& (cd client && npm run start)
.PHONY: debug

release: REACT_APP_SOCKET_HOST=${HOST}
release: REACT_APP_SOCKET_PORT=${PORT}
release:
	(cd client && npm run build) && (cd server && node server.js)
.PHONY: release