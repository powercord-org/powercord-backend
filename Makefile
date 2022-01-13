.PHONY: web
web:
	mkdir packages/api/dist || true
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker-compose --profile website up -d

.PHONY: boat
boat:
	mkdir packages/boat/dist || true
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker-compose --profile bot up -d

.PHONY: down
down:
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker-compose down

.PHONY: lint
lint:
	pnpm run lint -r --filter "@powercord/*"

.PHONY: build
build:
	pnpm run build -r --filter "@powercord/*"
