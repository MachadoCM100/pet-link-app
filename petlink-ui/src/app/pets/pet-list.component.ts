import { Component, OnInit } from '@angular/core';
import { PetService } from '../core/pet.service';
import { Pet } from './pet.model';

@Component({
  selector: 'app-pet-list',
  standalone: false,
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss'],

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