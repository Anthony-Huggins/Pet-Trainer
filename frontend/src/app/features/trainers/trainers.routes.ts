import { Routes } from '@angular/router';

export const TRAINERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/trainer-list/trainer-list.component').then(
        (m) => m.TrainerListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/trainer-profile/trainer-profile.component').then(
        (m) => m.TrainerProfileComponent
      ),
  },
];
