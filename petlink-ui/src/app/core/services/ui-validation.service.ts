import { Injectable } from '@angular/core';

/**
 * Frontend UI Validation Service
 * 
 * RESPONSIBILITY: Only UI/UX validation for immediate user feedback
 * - Required field checks
 * - Basic format validation (email, phone patterns)
 * - UI input length limits (prevent UI breaking)
 * - Client-side user experience improvements
 * 
 * NOT RESPONSIBLE FOR:
 * - Business logic validation (belongs in backend)
 * - Authorization checks
 * - Data integrity validations
 * - Uniqueness checks
 */

export interface UIValidationConfig {
  ui: {
    maxInputLength: number;        // Prevent UI breaking with very long inputs
    minPasswordLength: number;     // Basic security UX guidance
    emailPattern: RegExp;          // Email format validation
    phonePattern: RegExp;          // Phone format validation
    usernamePattern: RegExp;       // Username format validation
  };
}

export interface UIValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UIValidationService {
  
  private readonly config: UIValidationConfig = {
    ui: {
      maxInputLength: 500,           // Prevent extremely long inputs
      minPasswordLength: 6,          // Basic UX guidance
      emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phonePattern: /^\+?[\d\s\-\(\)]+$/,
      usernamePattern: /^[a-zA-Z0-9_]+$/
    }
  };

  /**
   * Validate form fields for immediate UI feedback
   */
  validateLoginForm(username: string, password: string): UIValidationResult {
    const errors: string[] = [];

    // Required field validation
    if (!username || username.trim() === '') {
      errors.push('Username is required');
    }

    if (!password || password.trim() === '') {
      errors.push('Password is required');
    }

    // Basic format validation
    if (username && username.length > this.config.ui.maxInputLength) {
      errors.push('Username is too long');
    }

    if (password && password.length < this.config.ui.minPasswordLength) {
      errors.push(`Password must be at least ${this.config.ui.minPasswordLength} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate registration form for immediate UI feedback
   */
  validateRegistrationForm(username: string, password: string, email: string): UIValidationResult {
    const errors: string[] = [];

    // Required field validation
    if (!username || username.trim() === '') {
      errors.push('Username is required');
    }

    if (!password || password.trim() === '') {
      errors.push('Password is required');
    }

    if (!email || email.trim() === '') {
      errors.push('Email is required');
    }

    // Format validation
    if (username && !this.config.ui.usernamePattern.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    if (password && password.length < this.config.ui.minPasswordLength) {
      errors.push(`Password must be at least ${this.config.ui.minPasswordLength} characters`);
    }

    if (email && !this.config.ui.emailPattern.test(email)) {
      errors.push('Please enter a valid email address');
    }

    // Length validation (UI protection)
    if (username && username.length > this.config.ui.maxInputLength) {
      errors.push('Username is too long');
    }

    if (email && email.length > this.config.ui.maxInputLength) {
      errors.push('Email is too long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate pet form for immediate UI feedback
   */
  validatePetForm(name: string, type: string, description?: string, age?: number): UIValidationResult {
    const errors: string[] = [];

    // Required field validation
    if (!name || name.trim() === '') {
      errors.push('Pet name is required');
    }

    if (!type || type.trim() === '') {
      errors.push('Pet type is required');
    }

    // Basic length validation (UI protection)
    if (name && name.length > this.config.ui.maxInputLength) {
      errors.push('Pet name is too long');
    }

    if (type && type.length > this.config.ui.maxInputLength) {
      errors.push('Pet type is too long');
    }

    if (description && description.length > this.config.ui.maxInputLength) {
      errors.push('Description is too long');
    }

    // Basic age validation (UI reasonableness check)
    if (age !== undefined && age !== null) {
      if (age < 0) {
        errors.push('Age cannot be negative');
      }
      if (age > 100) {
        errors.push('Age seems unreasonably high');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate individual email format
   */
  isValidEmailFormat(email: string): boolean {
    return this.config.ui.emailPattern.test(email);
  }

  /**
   * Validate individual phone format
   */
  isValidPhoneFormat(phone: string): boolean {
    return this.config.ui.phonePattern.test(phone);
  }

  /**
   * Check if input exceeds reasonable UI limits
   */
  isInputTooLong(input: string): boolean {
    return input.length > this.config.ui.maxInputLength;
  }

  /**
   * Get UI validation configuration
   */
  getUIConfig(): UIValidationConfig {
    return { ...this.config };
  }
}
