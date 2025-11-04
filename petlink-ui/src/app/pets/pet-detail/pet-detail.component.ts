import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../pet.service';
import { Pet, ApiResponse } from '../../core/models/api.models';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.scss'],
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule
  ]
})
export class PetDetailComponent implements OnInit {
  pet: Pet | null = null;
  isAdopting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petService: PetService
  ) {}

  ngOnInit(): void {
    const petId = Number(this.route.snapshot.paramMap.get('id'));
    if (petId) {
      this.loadPetDetails(petId);
    }
  }

  private loadPetDetails(petId: number): void {
    this.petService.getPetById(petId).subscribe({
      next: (response: ApiResponse<Pet>) => {
        if (response.success && response.data) {
          this.pet = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load pet details:', error);
        this.router.navigate(['/pets']);
      }
    });
  }

  adoptPet(): void {
    if (!this.pet) return;
    
    this.isAdopting = true;
    this.petService.adoptPet(this.pet.id).subscribe({
      next: (response: ApiResponse<Pet>) => {
        if (response.success && response.data) {
          this.pet = response.data; // Update with new adoption status
        }
        this.isAdopting = false;
      },
      error: (error) => {
        console.error('Failed to adopt pet:', error);
        this.isAdopting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pets']);
  }
}