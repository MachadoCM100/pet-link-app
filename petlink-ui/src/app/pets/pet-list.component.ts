import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { PetService } from './pet.service';
import { Pet, ApiResponse } from '../core/models/api.models';
import { PetFormDialogComponent } from './pet-form-dialog/pet-form-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule
  ]
})
export class PetListComponent implements OnInit {
  pets: Pet[] = [];
  isAdopting = false;

  constructor(
    private petService: PetService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPets();
  }

  private loadPets(): void {
    this.petService.getPets().subscribe({
      next: (response: ApiResponse<Pet[]>) => {
        if (response.success && response.data) {
          this.pets = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load pets:', error);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PetFormDialogComponent, {
      width: '500px',
      data: { pet: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPets(); // Refresh list
      }
    });
  }

  editPet(pet: Pet): void {
    const dialogRef = this.dialog.open(PetFormDialogComponent, {
      width: '500px',
      data: { pet: { ...pet }, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPets(); // Refresh list
      }
    });
  }

  viewPetDetails(petId: number): void {
    this.router.navigate(['/pets', petId]);
  }

  adoptPet(petId: number): void {
    this.isAdopting = true;
    this.petService.adoptPet(petId).subscribe({
      next: (response: ApiResponse<Pet>) => {
        if (response.success) {
          this.loadPets(); // Refresh to show updated status
        }
        this.isAdopting = false;
      },
      error: (error) => {
        console.error('Failed to adopt pet:', error);
        this.isAdopting = false;
      }
    });
  }

  deletePet(petId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this pet? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.petService.deletePet(petId).subscribe({
          next: (response: ApiResponse<any>) => {
            if (response.success) {
              this.loadPets(); // Refresh list
            }
          },
          error: (error) => {
            console.error('Failed to delete pet:', error);
          }
        });
      }
    });
  }
}