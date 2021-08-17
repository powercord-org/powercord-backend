.PHONY: web
web:
	mkdir packages/api/dist || true
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker-compose --profile website up -d

.PHONY: web-build
web-build:
	mkdir packages/api/dist || true
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker-compose --profile website up --build -d

.PHONY: boat
boat:
	mkdir packages/boat/dist || true
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker-compose --profile bot up -d

.PHONY: boat-build
boat-build:
	mkdir packages/boat/dist || true
	USER_ID="$$(id -u)" GROUP_ID="$$(id -g)" docker-compose --profile bot up --build -d

.PHONY: down
down:
	docker-compose down

.PHONY: lint
lint:
	pnpm run lint -r --filter "@powercord/*"

.PHONY: build
build:
	pnpm run build -r --filter "@powercord/*"
