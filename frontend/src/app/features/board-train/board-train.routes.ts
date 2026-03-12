import { Routes } from '@angular/router';

export const BOARD_TRAIN_ROUTES: Routes = [
  {
    path: 'request',
    loadComponent: () =>
      import('./pages/board-train-request/board-train-request.component').then(
        (m) => m.BoardTrainRequestComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/board-train-detail/board-train-detail.component').then(
        (m) => m.BoardTrainDetailComponent
      ),
  },
];
