import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pet } from '../pets/pet.model';
import { ApiConfigService } from './api-config.service';

@Injectable({ providedIn: 'root' })
export class PetService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  getPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiConfig.endpoints.pets.list);
  }
}
