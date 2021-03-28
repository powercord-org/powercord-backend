.PHONY: web
web:
	docker-compose --profile website up -d

.PHONY: boat
boat:
	docker-compose --profile bot up -d

.PHONY: down
down:
	docker-compose down
