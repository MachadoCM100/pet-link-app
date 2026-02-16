This README provides instructions for starting the PetLink application using Docker Compose in both development and production modes.

## Prerequisites

- Docker and Docker Compose installed.
- For development: Source code mounted for hot reload.
- For production: Pre-built images.

## Development Mode (with Hot Reload)

1. Ensure _docker-compose.override.yml_ is present for dev overrides. This file is used by default.
2. Run: _docker compose up_
- This builds images on the fly, mounts source code, and enables hot reload for backend (Spring Boot) and frontend 
   (Angular).

## Production Mode

1. Build the backend and frontend images: _docker compose -f docker-compose.yml build_
2. Run: _docker compose -f docker-compose.yml up_
- Uses pre-built images without source code mounting.

## Stopping Containers

Run: _docker-compose down_

If you need to reset the Docker DB (e.g., to re-run the init script), remove the db_data volume:
_docker-compose down -v._

Option "-v" removes the named volumes.

## Accessing the App
- 
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Database: localhost:5432 (if exposed)