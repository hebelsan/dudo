PORT ?= 5000
HOST ?= 192.168.178.80

debug:
	(cd server && npm run debug)& (cd client && npm run start)
.PHONY: debug

release: export REACT_APP_SOCKET_HOST=${HOST}
release: export REACT_APP_SOCKET_PORT=${PORT}
release:
	(cd client && npm run build) && (cd server && node server.js)
.PHONY: release