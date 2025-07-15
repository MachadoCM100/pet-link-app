# API Configuration Service

## Overview

The `ApiConfigService` provides centralized management of all API endpoints in the PetLink application. This pattern eliminates URL duplication, improves maintainability, and provides type safety.

## Location

- **Path**: `src/app/core/api-config.service.ts`
- **Injectable**: Root level (singleton across the application)

## Key Features

### 1. Centralized Endpoint Management

All API URLs are defined in a single location:

```typescript
public readonly endpoints: ApiEndpoints = {
  auth: {
    login: `${this.baseUrl}/auth/login`,
  },
  pets: {
    base: `${this.baseUrl}/api/pets`,
    list: `${this.baseUrl}/api/pets`,
  }
};
```

### 2. Type Safety

The `ApiEndpoints` interface ensures type safety and IntelliSense support:

```typescript
export interface ApiEndpoints {
  auth: {
    login: string;
  };
  pets: {
    base: string;
    list: string;
  };
}
```

### 3. Environment Integration

The service automatically uses the base URL from environment configuration:

```typescript
private readonly baseUrl = environment.apiUrl;
```

## Usage in Services

### AuthService Example

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient, 
    private router: Router,
    private apiConfig: ApiConfigService  // Inject the API config service
  ) {}

  login(username: string, password: string) {
    // Use centralized endpoint instead of hardcoded URL
    return this.http.post<{ token: string }>(this.apiConfig.endpoints.auth.login, { username, password });
  }
}
```

### PetService Example

```typescript
@Injectable({ providedIn: 'root' })
export class PetService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService  // Inject the API config service
  ) {}

  getPets(): Observable<Pet[]> {
    // Use centralized endpoint
    return this.http.get<Pet[]>(this.apiConfig.endpoints.pets.list);
  }
}
```

## Helper Methods

### getEndpoint()

Dynamically retrieves endpoints using dot notation:

```typescript
// Get endpoint by path
const loginUrl = this.apiConfig.getEndpoint('auth.login');
// Returns: 'http://localhost:5119/auth/login'
```

### buildUrl()

Builds URLs with relative paths:

```typescript
// Build URL for custom endpoint
const customUrl = this.apiConfig.buildUrl('/custom/endpoint');
// Returns: 'http://localhost:5119/custom/endpoint'
```

## Benefits

### 1. **Single Source of Truth**

- All API URLs defined in one place
- No duplication across services
- Easy to update base URLs or endpoints

### 2. **Type Safety**

- TypeScript interfaces prevent typos
- IntelliSense provides autocomplete
- Compile-time validation of endpoint paths

### 3. **Environment Awareness**

- Automatically uses environment-specific base URLs
- Easy to switch between dev/staging/production
- No hardcoded URLs in services

### 4. **Maintainability**

- Add new endpoints in one place
- Update existing endpoints without searching multiple files
- Clear documentation of all available endpoints

### 5. **Extensibility**

- Easy to add new API categories
- Support for nested endpoint groups
- Helper methods for custom URL building

## Adding New Endpoints

To add a new endpoint category:

1. **Update the interface**:

```typescript
export interface ApiEndpoints {
  auth: { login: string; };
  pets: { base: string; list: string; };
  // Add new category
  users: {
    profile: string;
    settings: string;
  };
}
```

2. **Add to the service**:

```typescript
public readonly endpoints: ApiEndpoints = {
  auth: { login: `${this.baseUrl}/auth/login` },
  pets: { base: `${this.baseUrl}/api/pets`, list: `${this.baseUrl}/api/pets` },
  // Implement new category
  users: {
    profile: `${this.baseUrl}/api/users/profile`,
    settings: `${this.baseUrl}/api/users/settings`,
  }
};
```

3. **Use in services**:

```typescript
getUserProfile() {
  return this.http.get(this.apiConfig.endpoints.users.profile);
}
```

## Migration from Direct URLs

### Before (scattered URLs)

```typescript
// AuthService
login() {
  return this.http.post(environment.apiUrl + '/auth/login', data);
}

// PetService  
getPets() {
  return this.http.get(environment.apiUrl + '/api/pets');
}
```

### After (centralized)

```typescript
// Both services use ApiConfigService
login() {
  return this.http.post(this.apiConfig.endpoints.auth.login, data);
}

getPets() {
  return this.http.get(this.apiConfig.endpoints.pets.list);
}
```

## Best Practices

1. **Group Related Endpoints**: Organize endpoints by feature/domain
2. **Use Descriptive Names**: Make endpoint purposes clear
3. **Maintain Consistency**: Follow naming conventions
4. **Document Changes**: Update this guide when adding endpoints
5. **Type Everything**: Always define TypeScript interfaces

## Integration with Environment

The service integrates seamlessly with Angular's environment system:

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:5119'  // Development
};

// environment.prod.ts
export const environment = {
  apiUrl: 'https://api.petlink.com'  // Production
};
```

The `ApiConfigService` automatically uses the correct base URL for each environment.
