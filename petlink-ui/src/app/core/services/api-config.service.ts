import { Injectable } from '@angular/core';
import { environment } from '../environment';

export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    refresh: string;
  };
  pets: {
    list: string;
    byId: (id: number) => string;
    adopt: (id: number) => string;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  private readonly baseUrl = environment.apiUrl;

  public readonly endpoints: ApiEndpoints = {
    auth: {
      login: `${this.baseUrl}/auth/login`,
      register: `${this.baseUrl}/auth/register`,
      refresh: `${this.baseUrl}/auth/refresh`,
    },
    pets: {
      list: `${this.baseUrl}/pets/getAllPets`,
      byId: (id: number) => `${this.baseUrl}/pets/${id}`,
      adopt: (id: number) => `${this.baseUrl}/pets/${id}/adopt`,
    }
  };

  /**
   * Get the full URL for a specific endpoint
   * @param path - API endpoint path (e.g., 'auth.login')
   * @returns Full URL string
   */
  getEndpoint(path: keyof ApiEndpoints | string): string {
    const pathParts = path.split('.');
    let endpoint: any = this.endpoints;

    for (const part of pathParts) {
      endpoint = endpoint[part];
      if (!endpoint) {
        throw new Error(`API endpoint not found: ${path}`);
      }
    }

    return endpoint;
  }

  /**
   * Build a URL with the base API URL
   * @param path - Relative path (e.g., '/auth/login')
   * @returns Full URL string
   */
  buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}
