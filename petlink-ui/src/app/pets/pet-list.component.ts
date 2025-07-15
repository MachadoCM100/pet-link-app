import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { PetService } from '../core/pet.service';
import { Pet } from './pet.model';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss'],
  imports: [CommonModule, MatListModule]
})
export class PetListComponent implements OnInit {
  pets: Pet[] = [];

  constructor(private petService: PetService) {}

  ngOnInit(): void {
    this.petService.getPets().subscribe(pets => this.pets = pets);
  }
}
// export class AppComponent {}
// This component fetches the list of pets from the PetService and displays them in the template.
// It uses the ngOnInit lifecycle hook to call the service when the component initializes.