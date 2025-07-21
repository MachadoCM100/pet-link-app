import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';
import { NotificationService } from '../notification/notification.service';

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
        
        // Show user notification for certain errors (optional)
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

  private shouldShowNotification(status: number): boolean {
    // Don't show notifications for authentication errors (handled by redirect)
    // or validation errors (handled by forms)
    return ![401, 400].includes(status);
  }
}
