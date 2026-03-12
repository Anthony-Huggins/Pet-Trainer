import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/manage-users/manage-users.component').then(
        (m) => m.ManageUsersComponent
      ),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/manage-services/manage-services.component').then(
        (m) => m.ManageServicesComponent
      ),
  },
  {
    path: 'classes',
    loadComponent: () =>
      import('./pages/manage-classes/manage-classes.component').then(
        (m) => m.ManageClassesComponent
      ),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/manage-bookings/manage-bookings.component').then(
        (m) => m.ManageBookingsComponent
      ),
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./pages/manage-reviews/manage-reviews.component').then(
        (m) => m.ManageReviewsComponent
      ),
  },
  {
    path: 'inquiries',
    loadComponent: () =>
      import('./pages/manage-inquiries/manage-inquiries.component').then(
        (m) => m.ManageInquiriesComponent
      ),
  },
  {
    path: 'revenue',
    loadComponent: () =>
      import('./pages/revenue-reports/revenue-reports.component').then(
        (m) => m.RevenueReportsComponent
      ),
  },
  {
    path: 'trainers',
    loadComponent: () =>
      import('./pages/manage-trainers/manage-trainers.component').then(
        (m) => m.ManageTrainersComponent
      ),
  },
];
