import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '../models/api.models';
import { NotificationService } from '../notification/notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwtToken';

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiConfig: ApiConfigService,
    private notificationService: NotificationService
  ) {}

  /**
   * Login using LoginRequest model
   */
  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(this.apiConfig.endpoints.auth.login, request)
      .pipe(
        tap(response => {
          if (response.success && response.data?.token) {
            this.storeToken(response.data.token);
            this.notificationService.showSuccess('Login successful!');
          }
        })
      );
  }

  /**
   * Register using RegisterRequest model
   */
  register(request: RegisterRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiConfig.endpoints.auth.register, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationService.showSuccess('Registration successful! Please log in.');
          }
        })
      );
  }

  /**
   * Store JWT token
   */
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
    // TODO: Add JWT expiration check if needed
  }

  /**
   * Logout user and redirect
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.notificationService.showInfo('You have been logged out.');
    this.router.navigate(['/login']);
  }

  /**
   * Handle authentication errors (called by error handler)
   */
  handleAuthError(): void {
    this.logout();
  }
}
