import { Routes } from '@angular/router';

export const REVIEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reviews-page/reviews-page.component').then(
        (m) => m.ReviewsPageComponent
      ),
  },
];
