.PHONY: web
web:
	docker-compose --profile website up -d

.PHONY: boat
boat:
	docker-compose --profile bot up -d

.PHONY: web-build
web-build:
	docker-compose --profile website up --build -d

.PHONY: boat-build
boat-build:
	docker-compose --profile bot up --build -d

.PHONY: down
down:
	docker-compose down

.PHONY: lint
lint:
	pnpm run lint -r --filter "@powercord/*"

.PHONY: build
build:
	pnpm run build -r --filter "@powercord/*"
