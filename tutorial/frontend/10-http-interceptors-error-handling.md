# HTTP Interceptors and Error Handling

## Overview

The PetLink frontend implements a sophisticated HTTP interceptor chain that handles authentication and error processing transparently across all HTTP requests. This architecture follows Angular best practices for cross-cutting concerns and provides a robust foundation for enterprise applications.

## Interceptor Architecture

### HTTP Interceptor Theory

**Interceptors as Middleware**:

- Interceptors implement the **Chain of Responsibility** pattern
- Each interceptor can modify requests, responses, or handle errors
- They provide a clean way to implement cross-cutting concerns

**Request/Response Flow**:

```txt
REQUEST:  Component → HttpClient → AuthInterceptor → GlobalErrorInterceptor → Backend API
RESPONSE: Component ← HttpClient ← AuthInterceptor ← GlobalErrorInterceptor ← Backend Response
```

**Strategic Implications**:

This order is actually ideal for this use case:

Current Order (AuthInterceptor → GlobalErrorInterceptor)

- Request: Auth header added before error interceptor
- Response: Global error handling happens first, then auth-specific logic
- Result: Global error interceptor catches 401 errors and handles logout before auth interceptor sees them

### 1. AuthInterceptor Implementation

```typescript
// core/interceptors/auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add Authorization header to authenticated requests
    const token = this.auth.getToken();
    
    if (token) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authRequest);
    }
    
    return next.handle(request);
  }
}
```

**Key Features**:

- **Immutable Requests**: Uses `request.clone()` to avoid mutation
- **Conditional Headers**: Only adds auth header when token exists
- **Transparent Operation**: Components don't need to handle authentication

### 2. GlobalErrorInterceptor Implementation

```typescript
// core/interceptors/global-error.interceptor.ts
@Injectable()
export class GlobalErrorInterceptor implements HttpInterceptor {
  constructor(
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Centralized error processing
        const processedError = this.errorHandler.processError(error);
        
        // Handle authentication errors
        if (error.status === 401) {
          this.handleUnauthorized();
        }
        
        // Show user notification for relevant errors
        if (this.shouldShowNotification(error.status)) {
          const message = this.errorHandler.getUserFriendlyMessage(processedError);
          this.notificationService.showError(message);
        }
        
        return throwError(() => processedError);
      })
    );
  }

  private handleUnauthorized(): void {
    // Clear token and redirect to login
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private shouldShowNotification(status: number): boolean {
    // Don't show notifications for certain status codes
    return ![401, 403].includes(status);
  }
}
```

## Error Handling Architecture

### Centralized Error Processing

**ErrorHandlerService Theory**:

- **Single Responsibility**: One service handles all error processing
- **Error Transformation**: Converts HTTP errors to user-friendly messages
- **Logging Integration**: Centralized logging for debugging and monitoring

```typescript
// core/services/error-handler.service.ts
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  processError(error: HttpErrorResponse): ApiError {
    // Transform HTTP error to standardized format
    return {
      statusCode: error.status,
      message: this.extractMessage(error),
      errors: this.extractValidationErrors(error),
      timestamp: new Date().toISOString()
    };
  }

  getUserFriendlyMessage(error: ApiError): string {
    switch (error.statusCode) {
      case 400:
        return 'Please check your input and try again.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}
```

### Notification System Integration

```typescript
// core/services/notification.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  showError(message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'error',
      message,
      duration,
      timestamp: new Date()
    });
  }

  // Automatic cleanup after duration
  private scheduleRemoval(notification: Notification): void {
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, notification.duration);
  }
}
```

## Interceptor Registration and Configuration

### Module Configuration

```typescript
// app.module.ts - Critical interceptor ordering
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,        // Order: 1
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: GlobalErrorInterceptor, // Order: 2
    multi: true
  }
]
```

**Why Order Matters**:

1. **AuthInterceptor First**: Ensures requests have proper authentication
2. **GlobalErrorInterceptor Second**: Handles any errors that occur after auth
3. **multi: true**: Allows multiple interceptors in the chain

Request Phase (Forward Chain):

1. AuthInterceptor adds the Authorization header first
2. GlobalErrorInterceptor receives the request with auth header already attached

Response Phase (Reverse Chain):

1. GlobalErrorInterceptor handles errors first (catches HTTP errors, shows notifications)
2. AuthInterceptor receives the processed response/error

_Key Point_: The last registered interceptor is the closest to the server in both directions, acting as the "outer layer" of the interceptor chain.

### Component Integration

```typescript
// Components benefit from transparent error handling
export class PetListComponent implements OnInit {
  constructor(private petService: PetService) {}

  ngOnInit(): void {
    // No explicit error handling needed - interceptor handles it
    this.petService.getPets().subscribe({
      next: (response) => {
        if (response.success) {
          this.pets = response.data || [];
        }
      }
      // Error handling automatic via GlobalErrorInterceptor
    });
  }
}
```

## Benefits of This Architecture

### 1. **Separation of Concerns**

- Authentication logic centralized in AuthInterceptor
- Error handling centralized in GlobalErrorInterceptor
- Components focus on business logic

### 2. **Consistency**

- All HTTP requests get the same authentication treatment
- All errors handled uniformly across the application
- User experience remains consistent

### 3. **Maintainability**

- Single place to modify authentication logic
- Centralized error handling reduces code duplication
- Easy to add new cross-cutting concerns

### 4. **Testability**

- Interceptors can be tested in isolation
- Components can be tested without mocking error handling
- Clear separation makes testing more focused

## Best Practices Implemented

1. **Immutable Request Handling**: Always clone requests before modification
2. **Error Recovery**: Graceful handling of authentication failures
3. **User Experience**: Automatic notifications for relevant errors
4. **Development Support**: Detailed error logging in development mode
5. **Security**: Automatic token cleanup on authentication failures

## Integration with Backend

The interceptor system seamlessly integrates with the backend's standardized error responses:

```typescript
// Backend API Response Format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  timestamp: string;
}

// Frontend handles this automatically
if (response.success) {
  // Process data
} else {
  // GlobalErrorInterceptor handles errors
}
```

This architecture provides a robust, maintainable foundation for handling HTTP communication and errors throughout the PetLink application.