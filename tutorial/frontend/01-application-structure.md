# Angular Application Structure

## Overview

The PetLink frontend is built using Angular 18+ with TypeScript. It follows Angular's recommended project structure and uses standalone components where appropriate.

## Project Structure

```txt
├── app.component.ts             # Root application component
├── app.config.ts                # Application configuration
├── app.module.ts                # Main application module
├── app-routing.module.ts        # Route definitions
├── core/                        # Core services and utilities
│   ├── auth.service.ts          # Handles authentication logic
│   ├── auth.guard.ts            # Protects routes based on auth state
│   ├── auth.interceptor.ts      # Intercepts HTTP requests for auth
│   ├── environment.ts           # Environment-specific settings
│   └── models/                  # Shared TypeScript interfaces and types
│       ├── pet.model.ts         # Pet data model interface
│       └── user.model.ts        # User data model interface
├── login/                       # Login feature module
│   ├── login.component.ts       # Login component logic
│   ├── login.component.html     # Login component template
│   ├── login.component.scss     # Login component styles
│   └── login.service.ts         # Handles login API calls
└── pets/                        # Pet management feature module
  ├── pet-list.component.ts     # Displays list of pets
  ├── pet-list.component.html   # Pet list template
  ├── pet-list.component.scss   # Pet list styles
  ├── pet-detail.component.ts   # Displays pet details
  ├── pet-detail.component.html # Pet detail template
  ├── pet-detail.component.scss # Pet detail styles
  ├── pet.service.ts            # Handles pet-related API calls
  └── pet.model.ts              # Pet-specific model (if different from shared)
```

## Key Components

### 1. App Component (`app.component.ts`)

The root component that bootstraps the entire application.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <h1>Welcome to PetLink!</h1>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
```

**Key Features:**

- **Selector**: `app-root` - This is the HTML tag used in `index.html`
- **Template**: Contains the main layout with router outlet
- **Router Outlet**: Displays different components based on the current route

### 2. App Module (`app.module.ts`)

The main module that declares components and imports necessary modules.

**Key Responsibilities:**

- Declares all components that are not standalone
- Imports required Angular modules
- Configures providers for services
- Sets up the bootstrap component

### 3. Core Directory

Contains shared services, guards, and utilities:

- **Services**: Reusable business logic
- **Guards**: Route protection logic
- **Interceptors**: HTTP request/response middleware
- **Models**: TypeScript interfaces and types

## Module vs Standalone Components

The application uses a hybrid approach based on loading strategy:

### Traditional Module-based Components

- `LoginComponent` - Uses the traditional module approach
- Declared in `AppModule` for eager loading
- Shares module imports with other eagerly loaded components
- Good for critical path components that need immediate availability

### Standalone Components

- `PetListComponent` - Uses the standalone approach
- Imports its own dependencies (`CommonModule`, `MatListModule`)
- Easier to test and more modular
- Perfect for lazy-loaded components

### 4. Core Error Handling Infrastructure

The application implements a robust error handling system through several key components:

- **Interceptors**: HTTP request/response middleware for cross-cutting concerns
- **Notification System**: Centralized user feedback mechanism
- **Global Error Handler**: Consistent error processing across the application

#### HTTP Interceptor Chain

```typescript
// app.module.ts - Interceptor registration order is critical
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,        // First: Add auth headers
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: GlobalErrorInterceptor, // Second: Handle errors
    multi: true
  }
]
```

**Interceptor Chain Theory**:

- **Sequential Processing**: Interceptors form a chain where each can modify requests/responses
- **Order Dependency**: AuthInterceptor must run before GlobalErrorInterceptor
- **Cross-Cutting Concerns**: Authentication and error handling apply to all HTTP calls
- **Separation of Concerns**: Each interceptor has a single responsibility

### 5. Component Declaration Strategy

```typescript
// app.module.ts - Core components declared at module level
declarations: [
  AppComponent,           // Root application component
  LoginComponent,         // Authentication component
  NotificationComponent   // Global notification system
]
```

**Module-Level vs Standalone Components**:

- **Module Components**: Core app infrastructure (login, notifications)
- **Standalone Components**: Feature-specific components (pet-list)
- **Lazy Loading**: Standalone components support better code splitting

## Angular Features Used

### 1. Dependency Injection

Services are injected into components using the constructor:

Example at `login.component.ts`:

```typescript
constructor(private auth: AuthService, private router: Router) {}
```

Example at `pet-list.component.ts`:

```typescript
constructor(private petService: PetService) {}
```

#### How It Works

- Angular sees that `PetListComponent` needs `PetService`
- It looks in its dependency injection container for a registered PetService
- Since PetService has `@Injectable({ providedIn: 'root' })`, it's automatically registered
- Angular creates or reuses an instance and injects it into your component

### 2. Reactive Programming with RxJS

HTTP calls return Observables for async data handling:

```typescript
this.auth.login(username, password).subscribe({
  next: res => { /* success */ },
  error: () => { /* error handling */ }
});
```

### 3. Routing

Navigation between different views using Angular Router:

```typescript
this.router.navigate(['/pets']);
```

### 4. Template Binding

Two-way data binding with forms:

```typescript
[(ngModel)]="username"
```

## Best Practices Implemented

1. **Separation of Concerns**: Logic in components, data access in services
2. **Type Safety**: TypeScript interfaces for all data models
3. **Lazy Loading**: Login component is loaded dynamically
4. **Guard Protection**: Routes protected with authentication guards
5. **Service Architecture**: Single responsibility services

## Next Steps

- [Routing and Navigation](./02-routing-navigation.md)
- [Authentication System](./03-authentication.md)
- [Pet Management Components](./04-pet-management.md)
