# PetLink Java Backend

This is the Java Spring Boot backend for the PetLink application, designed to work with the existing Angular frontend. See the `tutorial/backend-java/` for implementation details and migration notes.

## Structure
- `src/main/java/com/petlink/config` — Configuration (CORS, Security)
- `src/main/java/com/petlink/controller` — REST controllers
- `src/main/java/com/petlink/exception` — Global exception handling
- `src/main/java/com/petlink/model` — Data models and DTOs
- `src/main/java/com/petlink/service` — Business logic

## Getting Started
1. Install Java 25 and Maven.
2. Run `mvn spring-boot:run` in the `petlink-java` directory.
3. The backend will be available at `http://localhost:8080`.

## Endpoints
- `/api/auth/login` — Authenticate and receive JWT (dummy for now)
- `/api/pets` — CRUD for pets

## Next Steps
- Implement JWT generation and validation
- Connect to a real database
- Expand models and services as needed

See the tutorial for more details.

