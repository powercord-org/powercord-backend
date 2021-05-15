.PHONY: web
web:
	docker-compose --profile website up -d

.PHONY: boat
boat:
	docker-compose --profile bot up -d

.PHONY: down
down:
	docker-compose down

.PHONY: rm-images
rm-images:
	docker image rm powercord-web || true
	docker image rm powercord-api || true
	docker image rm powercord-boat || true

.PHONY: lint
lint:
	pnpm run lint -r --filter "@powercord/*"

.PHONY: build
build:
	pnpm run build -r --filter "@powercord/*"
