# BazarProject

A small bookstore-style microservice demo built with Node.js and Express. The project uses Docker Compose to run a frontend service plus replicated catalog and order services.

## Project overview

The application is composed of five services:

| Service | Port | Purpose |
| --- | ---: | --- |
| `frontend-service` | 3000 | Main entrypoint for users. Routes requests to catalog and order replicas and caches responses. |
| `catalog-service` | 3001 | Primary catalog service backed by `catalog.csv`. |
| `catalog-service-2` | 3003 | Replica of the catalog service. |
| `order-service` | 3002 | Primary order service backed by `orders.txt`. |
| `order-service-2` | 3004 | Replica of the order service. |

### Key behaviors

- The frontend load-balances requests between the two catalog replicas and the two order replicas.
- Catalog updates are persisted to `catalog.csv`.
- Orders are written to `orders.txt`.
- The frontend caches search and info calls, and invalidates cache entries when stock changes.
- Catalog services sync stock changes to each other to keep replicas aligned.
- Catalog data is restocked automatically every 60 seconds by adding `+2` stock to each book.

## Repository structure

- `docker-compose.yml` — container orchestration for all services.
- `catalog-service/` — primary catalog service.
- `catalog-service-2/` — catalog replica.
- `order-service/` — primary order service.
- `order-service-2/` — order replica.
- `frontend-service/` — API gateway and caching layer.
- `docs/test-notes.md` — manual verification notes and curl examples.

## Run locally with Docker

From the project root:

```bash
docker compose up --build
```

This will start all services and expose:

- Frontend: `http://localhost:3000`
- Catalog primary: `http://localhost:3001`
- Catalog replica: `http://localhost:3003`
- Order primary: `http://localhost:3002`
- Order replica: `http://localhost:3004`

## Run locally without Docker

If you want to run the services directly:

```bash
cd catalog-service
npm install
node index.js
```

Repeat for the other services as needed.

## API endpoints

### Frontend

- `GET /search/:topic`
- `GET /info/:id`
- `POST /purchase/:id`

### Catalog services

- `GET /search/:topic`
- `GET /info/:id`
- `POST /update/:id`
- `POST /sync/:id`

### Order services

- `POST /purchase/:id`

## Example requests

```bash
curl http://localhost:3000/search/distributed%20systems
curl http://localhost:3000/info/2
curl -X POST http://localhost:3000/purchase/2
```

## Data and persistence

- `catalog-service/catalog.csv` and `catalog-service-2/catalog.csv` are used as the catalog data source.
- `order-service/orders.txt` and `order-service-2/orders.txt` are used for order logs.
- Stock changes made through the order flow are persisted on the catalog service and synced to the replica.

## Notes

- The current package.json files do not define automated test scripts.
- Manual verification steps are documented in `docs/test-notes.md`.
- The frontend caches responses to reduce repeated calls to the catalog and order services.

## Useful commands

```bash
# Rebuild and start all containers

docker compose up --build

# Stop all containers

docker compose down

# View running containers

docker compose ps
```
