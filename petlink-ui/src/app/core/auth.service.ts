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
