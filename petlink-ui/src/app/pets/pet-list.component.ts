import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { PetService } from './pet.service';
import { Pet } from '../core/models/api.models';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss'],
  imports: [CommonModule, MatListModule]
})
export class PetListComponent implements OnInit {
  pets: Pet[] = [];
  isLoading = false;

  constructor(private petService: PetService) {}

  ngOnInit(): void {
    this.isLoading = true;
    
    this.petService.getPets().subscribe({
      next: response => {
        if (response.success && response.data) {
          this.pets = response.data;
        }
        this.isLoading = false;
      },
      error: error => {
        // Error handling is done by GlobalErrorInterceptor
        // Just reset loading state
        this.isLoading = false;
        console.error('Failed to fetch pets:', error);
      }
    });
  }
}
// It uses the ngOnInit lifecycle hook to call the service when the component initializes.