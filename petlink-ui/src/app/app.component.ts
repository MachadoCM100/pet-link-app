import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <h1>Welcome to PetLink!</h1>
    <router-outlet></router-outlet>
  `,
  // styleUrls: ['./app.component.css']
})
export class AppComponent {}