import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiConfigService } from '../core/services/api-config.service';
import {
  ApiResponse,
  Pet,
  CreatePetRequest,
  UpdatePetRequest,
  PaginatedResponse
} from '../core/models/api.models';
import { NotificationService } from '../core/notification/notification.service';

@Injectable({ providedIn: 'root' })
export class PetService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private notificationService: NotificationService
  ) {}

  /**
   * Get all pets with centralized error handling
   */
  getPets(): Observable<ApiResponse<Pet[]>> {
    return this.http.get<ApiResponse<Pet[]>>(this.apiConfig.endpoints.pets.base)
      .pipe(
        tap(response => {
          if (response.success) {
            const count = response.data?.length || 0;
            this.notificationService.showSuccess(`Loaded ${count} pets successfully`);
          }
        })
        // Error handling is done by GlobalErrorInterceptor
      );
  }

  /**
   * Get pet by ID
   */
  getPetById(id: number): Observable<ApiResponse<Pet>> {
    return this.http.get<ApiResponse<Pet>>(this.apiConfig.endpoints.pets.byId(id))
      .pipe(
        tap(response => {
          if (response.success) {
            console.log('Pet loaded successfully:', response.data?.name);
          }
        })
      );
  }

  /**
   * Create new pet - Backend handles all business logic validation
   */
  createPet(request: CreatePetRequest): Observable<ApiResponse<Pet>> {
    // No client-side business logic validation
    // Backend will validate business rules and return appropriate errors
    return this.http.post<ApiResponse<Pet>>(this.apiConfig.endpoints.pets.base, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationService.showSuccess(`Pet "${response.data?.name}" created successfully!`);
          }
        })
      );
  }

  /**
   * Update existing pet - Backend handles all business logic validation
   */
  updatePet(id: number, request: UpdatePetRequest): Observable<ApiResponse<Pet>> {
    // No client-side business logic validation
    // Backend will validate business rules and return appropriate errors
    return this.http.put<ApiResponse<Pet>>(this.apiConfig.endpoints.pets.byId(id), request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationService.showSuccess(`Pet "${response.data?.name}" updated successfully!`);
          }
        })
      );
  }

  /**
   * Delete pet
   */
  deletePet(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.apiConfig.endpoints.pets.byId(id))
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationService.showSuccess('Pet deleted successfully');
          }
        })
      );
  }

  /**
   * Adopt pet
   */
  adoptPet(id: number): Observable<ApiResponse<Pet>> {
    return this.http.post<ApiResponse<Pet>>(this.apiConfig.endpoints.pets.adopt(id), {})
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationService.showSuccess(`Pet "${response.data?.name}" adopted successfully! 🎉`);
          }
        })
      );
  }
}
