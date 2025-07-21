import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>🐾 PetLink</h1>
        <!-- Add navigation here if needed -->
      </header>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Global notification component -->
      <app-notification></app-notification>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background-color: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .app-main {
      flex: 1;
      padding: 2rem;
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {}