import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },  // Eager loading for critical path
  { path: 'pets', loadComponent: () => import('./pets/pet-list.component').then(m => m.PetListComponent), canActivate: [AuthGuard] }, // Lazy load authenticated content
  { path: 'pets/:id', loadComponent: () => import('./pets/pet-detail/pet-detail.component').then(m => m.PetDetailComponent)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
