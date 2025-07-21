import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { ApiError, ApiResponse } from '../models/api.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(
    private router: Router,
    private authService: AuthService // Add AuthService injection
  ) {}

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

    // Log the error (in a real app, you might send to a logging service)
    this.logError(apiError, error);

    return throwError(() => apiError);
  }

  /**
   * Handle validation errors specifically
   */
  handleValidationErrors(errors: string[]): string[] {
    // Process and format validation errors
    return errors.map(error => this.formatValidationError(error));
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

  private isApiResponse(obj: any): obj is ApiResponse<any> {
    return obj && typeof obj === 'object' && 'success' in obj;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (typeof error.error === 'string') {
      return error.error;
    }

    switch (error.status) {
      case 0:
        return 'Unable to connect to the server. Please check your internet connection.';
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
    }
  }

  private handleUnauthorized(): void {
    // Delegate to AuthService instead of handling directly
    this.authService.handleAuthError();
  }

  private handleForbidden(): void {
    // Could redirect to a "not authorized" page
    console.warn('Access forbidden - insufficient permissions');
  }

  private handleNotFound(error: ApiError): void {
    console.warn('Resource not found:', error.message);
  }

  private handleServerError(error: ApiError): void {
    console.error('Server error occurred:', error);
    // Could show a global error notification
  }

  private logError(apiError: ApiError, originalError: HttpErrorResponse): void {
    console.group('🚨 API Error');
    console.error('Status:', apiError.statusCode);
    console.error('Message:', apiError.message);
    if (apiError.errors) {
      console.error('Validation Errors:', apiError.errors);
    }
    console.error('Original Error:', originalError);
    console.error('Timestamp:', apiError.timestamp);
    console.groupEnd();
  }

  private formatValidationError(error: string): string {
    // Clean up validation error messages if needed
    return error.charAt(0).toUpperCase() + error.slice(1);
  }
}
