import { Routes } from '@angular/router';

export const TRAINER_PORTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/trainer-dashboard/trainer-dashboard.component').then(
        (m) => m.TrainerDashboardComponent
      ),
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./pages/trainer-schedule/trainer-schedule.component').then(
        (m) => m.TrainerScheduleComponent
      ),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./pages/trainer-clients/trainer-clients.component').then(
        (m) => m.TrainerClientsComponent
      ),
  },
  {
    path: 'log/new',
    loadComponent: () =>
      import(
        './pages/training-log-create/training-log-create.component'
      ).then((m) => m.TrainingLogCreateComponent),
  },
  {
    path: 'availability',
    loadComponent: () =>
      import(
        './pages/trainer-availability-manage/trainer-availability-manage.component'
      ).then((m) => m.TrainerAvailabilityManageComponent),
  },
];
