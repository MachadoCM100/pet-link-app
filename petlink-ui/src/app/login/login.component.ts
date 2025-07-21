import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UIValidationService, UIValidationResult } from '../core/services/ui-validation.service';
import { LoginRequest } from '../core/models/api.models';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginRequest: LoginRequest = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  uiErrors: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private uiValidation: UIValidationService
  ) {}

  onSubmit(): void {
    // Step 1: UI validation for immediate feedback
    const validation: UIValidationResult = this.uiValidation.validateLoginForm(
      this.loginRequest.username, 
      this.loginRequest.password
    );
    
    if (!validation.isValid) {
      this.uiErrors = validation.errors;
      return;
    }

    // Step 2: Clear UI errors and proceed
    this.uiErrors = [];
    this.isLoading = true;

    // Step 3: Call backend (business validation handled there)
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/pets']);
        }
      },
      error: () => {
        this.isLoading = false;
        // Error display handled by GlobalErrorInterceptor
      }
    });
  }

  onInputChange(): void {
    // Clear UI errors when user starts typing
    if (this.uiErrors.length > 0) {
      this.uiErrors = [];
    }
  }
}
