# Angular Application Structure

## Overview

The PetLink frontend is built using Angular 18+ with TypeScript. It follows Angular's recommended project structure and uses standalone components where appropriate.

## Project Structure

```txt
petlink-ui/src/app/
├── app.component.ts          # Root application component
├── app.config.ts            # Application configuration
├── app.module.ts            # Main application module
├── app-routing.module.ts    # Route definitions
├── core/                    # Core services and utilities
│   ├── auth.service.ts      # Authentication service
│   ├── auth.guard.ts        # Route protection
│   ├── auth.interceptor.ts  # HTTP request interceptor
│   ├── pet.service.ts       # Pet data service
│   └── environment.ts       # Environment configuration
├── login/                   # Login feature module
│   ├── login.component.ts   # Login component logic
│   ├── login.component.html # Login template
│   └── login.scss          # Login styles
└── pets/                    # Pet management module
    ├── pet-list.component.ts   # Pet list component
    ├── pet-list.component.html # Pet list template
    ├── pet-list.component.scss # Pet list styles
    └── pet.model.ts           # Pet data models
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

The application uses a hybrid approach:

### Traditional Module-based Components
- `PetListComponent` - Uses the traditional module approach
- Declared in `AppModule`
- Good for components with complex dependencies

### Standalone Components

- `LoginComponent` - Uses the standalone approach
- Imports its own dependencies
- Easier to test and more modular

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
