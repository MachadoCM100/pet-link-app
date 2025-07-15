# PetLink Application Tutorial

Welcome to the PetLink application tutorial! This directory contains comprehensive documentation explaining how each component of the PetLink application works, including both the Angular frontend and the .NET Core API backend.

## Overview

PetLink is a full-stack web application for managing pet adoption records. It consists of:

- **Frontend**: Angular 18+ application with TypeScript
- **Backend**: .NET 9.0 Web API with JWT authentication

## Architecture

```
PetLink Application
├── Frontend (Angular + TypeScript)
│   ├── Authentication Module
│   ├── Pet Management Module
│   └── Core Services
└── Backend (.NET Core Web API)
    ├── Authentication Controller
    ├── Pets Controller
    └── JWT Security Configuration
```

## Tutorial Sections

### Frontend (Angular/TypeScript)
1. [Application Structure](./frontend/01-application-structure.md)
2. [Routing and Navigation](./frontend/02-routing-navigation.md)
3. [Authentication System](./frontend/03-authentication.md)
4. [Pet Management Components](./frontend/04-pet-management.md)
5. [Services and HTTP Communication](./frontend/05-services-http.md)
6. [Models and Interfaces](./frontend/06-models-interfaces.md)

### Backend (.NET Core/C#)
1. [API Project Structure](./backend/01-api-structure.md)
2. [Authentication and JWT](./backend/02-authentication-jwt.md)
3. [Controllers and Endpoints](./backend/03-controllers-endpoints.md)
4. [Security and CORS](./backend/04-security-cors.md)
5. [Configuration and Startup](./backend/05-configuration-startup.md)

### Getting Started
- [Development Environment Setup](./setup/development-environment.md)
- [Running the Application](./setup/running-application.md)
- [Testing Guide](./setup/testing-guide.md)

## Quick Start

1. Start the backend API:
   ```bash
   cd PetLink.API
   dotnet run
   ```

2. Start the frontend application:
   ```bash
   cd petlink-ui
   npm start
   ```

3. Navigate to `http://localhost:4200` and login with:
   - Username: `admin`
   - Password: `password`

## Key Technologies

- **Frontend**: Angular 18, TypeScript, Angular Material, RxJS
- **Backend**: .NET 9.0, ASP.NET Core Web API, JWT Bearer Authentication
- **Development**: Node.js, npm, .NET CLI

---

For detailed explanations of each component, follow the tutorial sections above.

---

Version 1
Date: 15/07/2025
