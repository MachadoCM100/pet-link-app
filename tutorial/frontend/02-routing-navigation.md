# Routing and Navigation

## Overview

The PetLink application uses Angular Router for navigation between different views. The routing configuration is centralized in `app-routing.module.ts` and provides protected routes with authentication.

## Route Configuration

### Routes Definition (`app-routing.module.ts`)

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PetListComponent } from './pets/pet-list.component';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'pets', component: PetListComponent, canActivate: [AuthGuard] },
];
```

## Route Analysis

### 1. Default Route Redirect

```typescript
{ path: '', redirectTo: 'login', pathMatch: 'full' }
```

**Purpose**: Redirects users from the root URL (`/`) to the login page

**Key Properties**:

- `path: ''` - Matches the empty route (root URL)
- `redirectTo: 'login'` - Redirects to the login route
- `pathMatch: 'full'` - Only matches if the entire URL is empty

### 2. Login Route (Lazy Loading)

```typescript
{ path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) }
```

**Purpose**: Displays the login form for user authentication

**Key Features**:

- **Lazy Loading**: Component is loaded only when needed
- **Standalone Component**: Uses dynamic import for better performance
- **No Guards**: Accessible to unauthenticated users

**Benefits of Lazy Loading**:

- Smaller initial bundle size
- Faster application startup
- Better performance for large applications

### 3. Protected Pets Route

```typescript
{ path: 'pets', component: PetListComponent, canActivate: [AuthGuard] }
```

**Purpose**: Displays the list of pets (protected route)

**Key Features**:

- **Route Protection**: Requires authentication via `AuthGuard`
- **Module Component**: Traditional component declared in a module
- **Authorization**: Only accessible to authenticated users

## Route Guards

### Authentication Guard (`auth.guard.ts`)

Route guards control access to specific routes based on conditions.

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

**How it Works**:

1. **Check Authentication**: Calls `auth.isAuthenticated()`
2. **Allow Access**: Returns `true` if user is authenticated
3. **Redirect**: Navigates to login if not authenticated
4. **Deny Access**: Returns `false` to prevent route activation

## Navigation in Components

### Programmatic Navigation

Components can navigate programmatically using the Router service:

```typescript
// In LoginComponent
constructor(private auth: AuthService, private router: Router) {}

login() {
  this.auth.login(this.username, this.password).subscribe({
    next: res => {
      this.auth.storeToken(res.token);
      this.router.navigate(['/pets']); // Navigate to pets page
    },
    error: () => alert('Invalid credentials')
  });
}
```

### Router Outlet

The main app template uses `<router-outlet>` to display routed components:

```typescript
template: `
  <h1>Welcome to PetLink!</h1>
  <router-outlet></router-outlet>
`
```

**Function**: Acts as a placeholder where routed components are rendered

## Route Flow

### Typical User Journey

1. **Initial Load**: User visits `/` → Redirected to `/login`
2. **Login**: User enters credentials and submits form
3. **Authentication**: If successful, navigate to `/pets`
4. **Protection**: AuthGuard verifies authentication before showing pets
5. **Access Granted**: PetListComponent is displayed

### URL Structure

- `http://localhost:4200/` → Redirects to login
- `http://localhost:4200/login` → Shows login form
- `http://localhost:4200/pets` → Shows pet list (requires auth)

## Advanced Routing Features

### Lazy Loading Benefits

```typescript
loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
```

**Advantages**:

- **Code Splitting**: Component code is in a separate bundle
- **On-Demand Loading**: Only loaded when route is accessed
- **Performance**: Faster initial application load

### Route Protection Strategy

The application implements a security-first approach:

- **Default Redirect**: Prevents access to empty routes
- **Guard Protection**: Ensures only authenticated users access protected features
- **Fallback Navigation**: Redirects unauthorized users to login

## Best Practices Implemented

1. **Centralized Routing**: All routes defined in one module
2. **Lazy Loading**: Non-critical components loaded on-demand
3. **Route Protection**: Guards prevent unauthorized access
4. **Clear URLs**: Semantic route paths (`/login`, `/pets`)
5. **Redirect Strategy**: Logical default navigation

## Next Steps

- [Authentication System](./03-authentication.md)
- [Pet Management Components](./04-pet-management.md)
