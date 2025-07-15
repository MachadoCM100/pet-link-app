# Authentication System

## Overview

The PetLink authentication system is built around JWT (JSON Web Tokens) and provides secure user authentication with token-based authorization. The system includes login functionality, token management, and route protection.

## Architecture Components

### 1. AuthService - Core Authentication Logic
### 2. AuthGuard - Route Protection
### 3. AuthInterceptor - HTTP Request Enhancement
### 4. LoginComponent - User Interface

**Note**: The authentication system integrates with the centralized [API Configuration Service](./08-api-configuration.md) for endpoint management.

## AuthService (`auth.service.ts`)

The central service that handles all authentication operations.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiConfigService } from './api-config.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'jwtToken';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private apiConfig: ApiConfigService
  ) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(this.apiConfig.endpoints.auth.login, { username, password });
  }

  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
}
```

### Service Methods Breakdown

#### `login(username: string, password: string)`

**Purpose**: Authenticates user credentials with the backend API

**Process**:

1. Uses centralized API configuration to get login endpoint
2. Sends POST request to the login endpoint via `ApiConfigService`
3. Returns Observable with JWT token response
4. Handles authentication validation server-side

**API Integration**: Uses `this.apiConfig.endpoints.auth.login` from centralized configuration

**Return Type**: `Observable<{ token: string }>`

#### `storeToken(token: string)`

**Purpose**: Securely stores JWT token in browser's localStorage

**Security Considerations**:

- Uses consistent token key (`jwtToken`)
- localStorage persists across browser sessions
- Token available for HTTP interceptor usage

#### `getToken(): string | null`

**Purpose**: Retrieves stored JWT token for API requests

**Usage**:

- Called by HTTP interceptor
- Used for authentication state checking
- Returns null if no token exists

#### `isAuthenticated(): boolean`

**Purpose**: Checks if user is currently authenticated

**Logic**: Uses double negation (`!!`) to convert token existence to boolean

**Use Cases**:

- Route guard validation
- UI conditional rendering
- Component logic decisions

#### `logout()`

**Purpose**: Clears authentication state and redirects to login

**Process**:

1. Removes token from localStorage
2. Navigates user back to login page
3. Ensures clean logout state

## LoginComponent (`login.component.ts`)

Provides the user interface for authentication.

```typescript
import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: res => {
        this.auth.storeToken(res.token);
        this.router.navigate(['/pets']);
      },
      error: () => alert('Invalid credentials')
    });
  }
}
```

### Component Features

#### Module-Based Architecture

- **Declared Component**: Part of the main application module (`app.module.ts`)
- **Focused Responsibility**: Handles only UI logic and user interaction
- **Service Integration**: Uses `AuthService` for all authentication operations

#### API Configuration Integration

The `LoginComponent` **indirectly** benefits from the centralized API configuration:

- **No Direct Dependency**: Component doesn't import `ApiConfigService`
- **Through AuthService**: Benefits from centralized endpoints via `AuthService`
- **Clean Architecture**: Maintains separation between UI and API concerns

#### Login Flow

1. **User Input**: Binds form fields to component properties
2. **Submit**: Calls AuthService.login() with credentials
3. **Success Handler**: Stores token and navigates to pets page
4. **Error Handler**: Shows alert for invalid credentials

#### Reactive Programming

Uses RxJS Observable pattern for asynchronous operations:

```typescript
this.auth.login(this.username, this.password).subscribe({
  next: res => { /* Success handling */ },
  error: () => { /* Error handling */ }
});
```

## AuthGuard (`auth.guard.ts`)

Protects routes from unauthorized access.

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### Guard Functionality

#### `canActivate(): boolean`

**Purpose**: Determines if route can be activated

**Logic**:
1. Check if user is authenticated
2. Allow access if authenticated (return true)
3. Redirect to login if not authenticated
4. Deny access (return false)

**Integration**: Applied to protected routes in routing configuration

## AuthInterceptor (`auth.interceptor.ts`)

Automatically adds JWT token to HTTP requests through Angular's interceptor chain system.

```typescript
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

### How AuthInterceptor is Wired into the Application

#### Angular's HTTP Interceptor Chain System

The `AuthInterceptor` is registered in `app.module.ts` through Angular's built-in interceptor system:

```typescript
// app.module.ts
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

**Key Configuration Details**:
- `HTTP_INTERCEPTORS`: Angular's injection token for HTTP interceptors
- `multi: true`: Allows multiple interceptors to be registered in a chain
- **Automatic Integration**: Angular applies this to ALL HTTP requests made with `HttpClient`

#### Automatic Request Interception

When ANY service makes an HTTP request using `HttpClient`, Angular automatically:

1. **Intercepts the Request**: Before sending to the server
2. **Runs AuthInterceptor**: Calls the `intercept()` method
3. **Adds Authorization Header**: If a valid token exists
4. **Continues Chain**: Passes to next interceptor or makes the actual HTTP call

#### Visual Flow

```mermaid
graph TD
    A[Service calls HttpClient] --> B[Angular HTTP Interceptor Chain]
    B --> C[AuthInterceptor intercept method]
    C --> D{Token exists?}
    D -->|Yes| E[Clone request + add Bearer token]
    D -->|No| F[Pass request unchanged]
    E --> G[Continue to HTTP call]
    F --> G
    G --> H[Backend API]
    H --> I[Response back through chain]
    I --> J[Service receives response]
```

#### Example in Action

When your services make requests, the interceptor works transparently:

```typescript
// PetService makes this call
this.http.get<Pet[]>(this.apiConfig.endpoints.pets.list)

// AuthInterceptor AUTOMATICALLY intercepts and modifies it to:
// GET /api/pets
// Headers: {
//   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// }
```

### Key Responsibilities

1. **Token Injection**: Adds Authorization header to outgoing requests
2. **Dynamic Token Retrieval**: Gets fresh token from AuthService for each request
3. **Automatic Handling**: No manual token management needed in services
4. **Transparent Operation**: Services don't need to know about authentication headers

### Benefits of This Architecture

**Automatic Application**:
- No need to manually add headers in every service method
- Consistent authentication across all HTTP requests
- Zero code changes needed in individual services

**Centralized Logic**:
- All authentication header logic in one place
- Easy to modify token handling globally
- Can add logging, error handling, or request transformation

**Clean Service Code**:
```typescript
// Services focus on business logic, not authentication
getPets(): Observable<Pet[]> {
  return this.http.get<Pet[]>(this.apiConfig.endpoints.pets.list);
  // ↑ AuthInterceptor automatically adds token if user is authenticated
}
```

**Testing and Verification**:
To verify the interceptor is working:
1. Login to the application
2. Open browser DevTools → Network tab
3. Navigate to pets page (triggers HTTP requests)
4. Check request headers - you should see:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Authentication Flow

### Complete Login Process

```mermaid
sequenceDiagram
    participant U as User
    participant LC as LoginComponent
    participant AS as AuthService
    participant API as Backend API
    participant R as Router

    U->>LC: Enter credentials
    LC->>AS: login(username, password)
    AS->>API: POST /auth/login
    API-->>AS: JWT token
    AS->>AS: storeToken()
    AS-->>LC: Success response
    LC->>R: navigate(['/pets'])
    R-->>U: Show pets page
```

### Route Protection Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Router
    participant AG as AuthGuard
    participant AS as AuthService

    U->>R: Navigate to /pets
    R->>AG: canActivate()
    AG->>AS: isAuthenticated()
    AS-->>AG: true/false
    alt Authenticated
        AG-->>R: true
        R-->>U: Show pets page
    else Not Authenticated
        AG->>R: navigate(['/login'])
        R-->>U: Show login page
    end
```

## Security Features

### Token Storage

- **LocalStorage**: Persists across browser sessions
- **Consistent Key**: Uses standardized token key
- **Automatic Cleanup**: Removed on logout

### Request Security

- **Bearer Token**: Standard JWT authorization header
- **Automatic Injection**: No manual token handling needed
- **API Scoped**: Only affects backend API requests

### Route Protection

- **Guard-based**: Prevents unauthorized route access
- **Automatic Redirect**: Seamless user experience
- **State Preservation**: Returns to intended route after login

## Best Practices Implemented

1. **Single Responsibility**: Each service handles specific auth concerns
2. **Reactive Programming**: Uses Observables for async operations
3. **Error Handling**: Provides user feedback on failures
4. **Security First**: Guards protect sensitive routes
5. **Token Management**: Centralized token storage and retrieval
6. **User Experience**: Automatic redirects and state management
7. **API Configuration**: Uses centralized endpoint management for maintainability

## API Integration

The AuthService integrates with the [API Configuration Service](./08-api-configuration.md) to provide:

- **Centralized Endpoints**: All authentication URLs managed in one place
- **Environment Awareness**: Automatic dev/production URL switching
- **Type Safety**: Compile-time validation of endpoint usage
- **Easy Maintenance**: Update authentication endpoints without code changes

### Migration Benefits

**Before** (direct URL concatenation):

```typescript
this.http.post(environment.apiUrl + '/auth/login', credentials)
```

**After** (centralized configuration):

```typescript
this.http.post(this.apiConfig.endpoints.auth.login, credentials)
```

## Demo Credentials

For development and testing:

- **Username**: `admin`
- **Password**: `password`

## Next Steps

- [Pet Management Components](./04-pet-management.md)
- [Services and HTTP Communication](./05-services-http.md)
- [API Configuration Service](./08-api-configuration.md) - Learn about centralized endpoint management
