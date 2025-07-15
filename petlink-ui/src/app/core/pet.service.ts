import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pet } from '../pets/pet.model';
import { environment } from '../core/environment'; // Adjust the import path as necessary

@Injectable({ providedIn: 'root' })
export class PetService {
  private apiUrl = environment.apiUrl + '/api/pets';

  constructor(private http: HttpClient) {}

  getPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiUrl);
  }
}
