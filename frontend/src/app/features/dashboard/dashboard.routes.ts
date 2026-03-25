import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-home/dashboard-home.component').then(
        (m) => m.DashboardHomeComponent
      ),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/my-bookings/my-bookings.component').then(
        (m) => m.MyBookingsComponent
      ),
  },
  {
    path: 'dogs',
    loadComponent: () =>
      import('./pages/my-dogs/my-dogs.component').then(
        (m) => m.MyDogsComponent
      ),
  },
  {
    path: 'dogs/new',
    loadComponent: () =>
      import('./pages/dog-add-edit/dog-add-edit.component').then(
        (m) => m.DogAddEditComponent
      ),
  },
  {
    path: 'dogs/:id',
    loadComponent: () =>
      import('./pages/dog-profile/dog-profile.component').then(
        (m) => m.DogProfileComponent
      ),
  },
  {
    path: 'dogs/:id/edit',
    loadComponent: () =>
      import('./pages/dog-add-edit/dog-add-edit.component').then(
        (m) => m.DogAddEditComponent
      ),
  },
  {
    path: 'training',
    loadComponent: () =>
      import('./pages/training-progress/training-progress.component').then(
        (m) => m.TrainingProgressComponent
      ),
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/payment-history/payment-history.component').then(
        (m) => m.PaymentHistoryComponent
      ),
  },
  {
    path: 'packages',
    loadComponent: () =>
      import('./pages/my-packages/my-packages.component').then(
        (m) => m.MyPackagesComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile-settings/profile-settings.component').then(
        (m) => m.ProfileSettingsComponent
      ),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./pages/notifications/notifications.component').then(
        (m) => m.NotificationsComponent
      ),
  },
  {
    path: 'referrals',
    loadComponent: () =>
      import('./pages/referral-dashboard/referral-dashboard.component').then(
        (m) => m.ReferralDashboardComponent
      ),
  },
];
