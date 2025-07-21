# Frontend Centralized Error Handling and Validation

## Overview

The PetLink frontend implements a comprehensive **centralized error handling and validation system** that mirrors the backend architecture, providing consistent user experience and maintainable code structure.

## 🎯 **Architecture Components**

### **1. API Response Models** (`core/models/api.models.ts`)

Strongly typed models that match the backend API structure:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}
```

### **2. Centralized Error Handler Service** (`core/services/error-handler.service.ts`)

Processes all HTTP errors with intelligent handling:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  /**
   * Centralized error handling for HTTP errors
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error && this.isApiResponse(error.error)) {
      // Backend returned a structured error response
      apiError = {
        statusCode: error.status,
        message: error.error.message || 'An error occurred',
        errors: error.error.errors,
        timestamp: error.error.timestamp || new Date().toISOString()
      };
    } else {
      // Network error or other unexpected error
      apiError = {
        statusCode: error.status || 0,
        message: this.getErrorMessage(error),
        timestamp: new Date().toISOString()
      };
    }

    // Handle specific status codes
    switch (error.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        this.handleForbidden();
        break;
      case 404:
        this.handleNotFound(apiError);
        break;
      case 500:
        this.handleServerError(apiError);
        break;
    }

    return throwError(() => apiError);
  }

  /**
   * Display user-friendly error messages
   */
  getUserFriendlyMessage(error: ApiError): string {
    switch (error.statusCode) {
      case 400:
        return error.errors && error.errors.length > 0 
          ? 'Please check your input and try again.' 
          : error.message;
      case 401:
        return 'Please log in to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'An unexpected error occurred. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
}
```

### **3. Global HTTP Error Interceptor** (`core/interceptors/global-error.interceptor.ts`)

Automatically handles all HTTP errors:

```typescript
@Injectable()
export class GlobalErrorInterceptor implements HttpInterceptor {
  constructor(
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Use centralized error handling
        const handledError = this.errorHandler.handleError(error);
        
        // Show user notification for certain errors
        if (this.shouldShowNotification(error.status)) {
          handledError.subscribe({
            error: (apiError) => {
              const message = this.errorHandler.getUserFriendlyMessage(apiError);
              this.notificationService.showError(message);
            }
          });
        }

        return handledError;
      })
    );
  }
}
```

### **4. Notification Service** (`core/services/notification.service.ts`)

Manages user notifications with different types:

```typescript
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  showSuccess(message: string, duration: number = 5000): void {
    this.addNotification('success', message, duration);
  }

  showError(message: string, duration: number = 7000): void {
    this.addNotification('error', message, duration);
  }

  showWarning(message: string, duration: number = 6000): void {
    this.addNotification('warning', message, duration);
  }

  showInfo(message: string, duration: number = 4000): void {
    this.addNotification('info', message, duration);
  }
}
```

### **5. Configuration-Driven Validation Service** (`core/services/validation.service.ts`)

Client-side validation that matches backend rules:

```typescript
export interface ValidationConfig {
  pet: {
    nameMinLength: number;
    nameMaxLength: number;
    typeMinLength: number;
    typeMaxLength: number;
    descriptionMaxLength: number;
    minAge: number;
    maxAge: number;
  };
  user: {
    usernameMinLength: number;
    usernameMaxLength: number;
    passwordMinLength: number;
    passwordMaxLength: number;
    emailMaxLength: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  /**
   * Validate pet creation request
   */
  validateCreatePetRequest(request: any): string[] {
    const errors: string[] = [];
    const petConfig = this.config.pet;

    if (!request.name || request.name.trim() === '') {
      errors.push('Pet name is required');
    } else if (request.name.length < petConfig.nameMinLength) {
      errors.push(`Pet name must be at least ${petConfig.nameMinLength} characters`);
    }

    // More validation rules...
    return errors;
  }

  /**
   * Validate login request
   */
  validateLoginRequest(request: any): string[] {
    // Validation logic that matches backend
  }
}
```

### **6. Enhanced Services with Error Handling**

Updated services use centralized error handling:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private validationService: ValidationService,
    private notificationService: NotificationService
  ) {}

  /**
   * Login with centralized validation and error handling
   */
  login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    const request: LoginRequest = { username, password };
    
    // Client-side validation (optional - backend will also validate)
    const validationErrors = this.validationService.validateLoginRequest(request);
    if (validationErrors.length > 0) {
      this.notificationService.showError(validationErrors[0]);
      throw new Error(validationErrors[0]);
    }

    return this.http.post<ApiResponse<LoginResponse>>(this.apiConfig.endpoints.auth.login, request)
      .pipe(
        tap(response => {
          if (response.success && response.data?.token) {
            this.storeToken(response.data.token);
            this.notificationService.showSuccess('Login successful!');
          }
        })
        // Error handling is done by GlobalErrorInterceptor
      );
  }
}
```

### **7. Notification Component** (`shared/notification.component.ts`)

Displays user notifications with beautiful UI:

```typescript
@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications" 
        class="notification"
        [class.success]="notification.type === 'success'"
        [class.error]="notification.type === 'error'"
        [class.warning]="notification.type === 'warning'"
        [class.info]="notification.type === 'info'"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <span *ngIf="notification.type === 'success'">✅</span>
            <span *ngIf="notification.type === 'error'">❌</span>
            <span *ngIf="notification.type === 'warning'">⚠️</span>
            <span *ngIf="notification.type === 'info'">ℹ️</span>
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <button 
            class="notification-close"
            (click)="removeNotification(notification.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  
  constructor(private notificationService: NotificationService) {}
}
```

## 🚀 **Error Handling Flow**

### **Complete Error Handling Pipeline:**

```
1. HTTP Request
   ↓
2. GlobalErrorInterceptor (catches all HTTP errors)
   ↓
3. ErrorHandlerService (processes error based on type)
   ↓
4. NotificationService (shows user-friendly message)
   ↓
5. Specific handling (auth redirect, logging, etc.)
```

### **Validation Flow:**

```
1. User Input
   ↓
2. ValidationService (client-side validation)
   ↓
3. HTTP Request (if validation passes)
   ↓
4. Backend Validation (server-side validation)
   ↓
5. Error Response (if backend validation fails)
   ↓
6. GlobalErrorInterceptor (handles backend validation errors)
   ↓
7. NotificationService (shows validation errors to user)
```

## 💡 **Benefits**

### **For Developers:**
- ✅ **Consistent Error Handling**: Single place to handle all errors
- ✅ **Type Safety**: Strongly typed API responses and errors
- ✅ **Configuration-Driven**: Validation rules match backend configuration
- ✅ **Reusable**: Services can be used across all components
- ✅ **Maintainable**: Easy to modify error handling behavior

### **For Users:**
- ✅ **User-Friendly Messages**: Technical errors converted to readable messages
- ✅ **Visual Feedback**: Beautiful notifications for success/error states
- ✅ **Consistent Experience**: Same error handling patterns throughout the app
- ✅ **Immediate Feedback**: Client-side validation provides instant feedback

### **For Operations:**
- ✅ **Centralized Logging**: All errors logged in consistent format
- ✅ **Error Classification**: Different handling for different error types
- ✅ **Debugging**: Comprehensive error information in development mode

## 🎯 **Usage Examples**

### **Simple Service Call with Error Handling:**

```typescript
// Before (manual error handling):
this.petService.getPets().subscribe({
  next: (pets) => {
    console.log('Loaded pets:', pets);
  },
  error: (error) => {
    console.error('Error loading pets:', error);
    alert('Failed to load pets'); // Poor UX
  }
});

// After (centralized error handling):
this.petService.getPets().subscribe({
  next: (response) => {
    if (response.success) {
      this.pets = response.data || [];
      // Success notification already shown by service
    }
  }
  // No need for error handling - handled by interceptor
});
```

### **Form Validation with Configuration:**

```typescript
// Component
onSubmit() {
  const request = {
    name: this.petForm.value.name,
    type: this.petForm.value.type,
    age: this.petForm.value.age
  };

  // Client-side validation
  const errors = this.validationService.validateCreatePetRequest(request);
  if (errors.length > 0) {
    this.validationErrors = errors;
    return;
  }

  // Submit to backend
  this.petService.createPet(request).subscribe({
    next: (response) => {
      if (response.success) {
        this.router.navigate(['/pets']);
        // Success notification already shown by service
      }
    }
    // Error handling automatic via interceptor
  });
}
```

This centralized approach provides a robust, maintainable, and user-friendly error handling system that matches the backend architecture and ensures consistent behavior throughout the PetLink application!
