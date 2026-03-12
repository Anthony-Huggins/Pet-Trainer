import { Routes } from '@angular/router';

export const CLASSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/class-schedule/class-schedule.component').then(
        (m) => m.ClassScheduleComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/class-detail/class-detail.component').then(
        (m) => m.ClassDetailComponent
      ),
  },
];
