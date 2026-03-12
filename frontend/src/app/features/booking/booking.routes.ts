import { Routes } from '@angular/router';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/book-session/book-session.component').then(
        (m) => m.BookSessionComponent
      ),
  },
  {
    path: 'success',
    loadComponent: () =>
      import('./pages/booking-success/booking-success.component').then(
        (m) => m.BookingSuccessComponent
      ),
  },
  {
    path: 'cancel',
    loadComponent: () =>
      import('./pages/booking-cancel/booking-cancel.component').then(
        (m) => m.BookingCancelComponent
      ),
  },
];
