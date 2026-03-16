import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./features/services/services.routes').then(
            (m) => m.SERVICES_ROUTES
          ),
      },
      {
        path: 'trainers',
        loadChildren: () =>
          import('./features/trainers/trainers.routes').then(
            (m) => m.TRAINERS_ROUTES
          ),
      },
      {
        path: 'classes',
        loadChildren: () =>
          import('./features/classes/classes.routes').then(
            (m) => m.CLASSES_ROUTES
          ),
      },
      {
        path: 'reviews',
        loadChildren: () =>
          import('./features/reviews/reviews.routes').then(
            (m) => m.REVIEWS_ROUTES
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import(
            './features/contact/pages/contact-page/contact-page.component'
          ).then((m) => m.ContactPageComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import(
            './features/about/pages/about-page/about-page.component'
          ).then((m) => m.AboutPageComponent),
      },
      {
        path: 'book',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/booking/booking.routes').then(
            (m) => m.BOOKING_ROUTES
          ),
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'board-train',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/board-train/board-train.routes').then(
            (m) => m.BOARD_TRAIN_ROUTES
          ),
      },
      {
        path: 'trainer',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/trainer-portal/trainer-portal.routes').then(
            (m) => m.TRAINER_PORTAL_ROUTES
          ),
      },
      {
        path: 'admin',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/admin/admin.routes').then(
            (m) => m.ADMIN_ROUTES
          ),
      },
    ],
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
