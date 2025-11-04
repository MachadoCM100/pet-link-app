import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { PetService } from '../pet.service';
import { Pet, CreatePetRequest, UpdatePetRequest, ApiResponse } from '../../core/models/api.models';

export interface PetDialogData {
  pet: Pet | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-pet-form-dialog',
  standalone: true,
  templateUrl: './pet-form-dialog.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatSelectModule,
    MatDialogModule,
    CommonModule
  ],
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class PetFormDialogComponent {
  petForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    public dialogRef: MatDialogRef<PetFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PetDialogData
  ) {
    this.petForm = this.fb.group({
      name: [data.pet?.name || '', Validators.required],
      type: [data.pet?.type || '', Validators.required],
      age: [data.pet?.age || null],
      description: [data.pet?.description || '']
    });
  }

  onSubmit(): void {
    if (this.petForm.valid) {
      this.isSubmitting = true;
      
      if (this.data.isEdit && this.data.pet) {
        this.updatePet();
      } else {
        this.createPet();
      }
    }
  }

  private createPet(): void {
    const request: CreatePetRequest = this.petForm.value;
    
    this.petService.createPet(request).subscribe({
      next: (response: ApiResponse<Pet>) => {
        if (response.success) {
          this.dialogRef.close(true);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Failed to create pet:', error);
        this.isSubmitting = false;
      }
    });
  }

  private updatePet(): void {
    if (!this.data.pet) return;
    
    const request: UpdatePetRequest = this.petForm.value;
    
    this.petService.updatePet(this.data.pet.id, request).subscribe({
      next: (response: ApiResponse<Pet>) => {
        if (response.success) {
          this.dialogRef.close(true);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Failed to update pet:', error);
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}