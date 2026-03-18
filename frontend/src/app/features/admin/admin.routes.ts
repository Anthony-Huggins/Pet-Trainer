import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'users',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/manage-users/manage-users.component').then(
        (m) => m.ManageUsersComponent
      ),
  },
  {
    path: 'services',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/manage-services/manage-services.component').then(
        (m) => m.ManageServicesComponent
      ),
  },
  {
    path: 'classes',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/manage-classes/manage-classes.component').then(
        (m) => m.ManageClassesComponent
      ),
  },
  {
    path: 'bookings',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/manage-bookings/manage-bookings.component').then(
        (m) => m.ManageBookingsComponent
      ),
  },
  {
    path: 'reviews',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/manage-reviews/manage-reviews.component').then(
        (m) => m.ManageReviewsComponent
      ),
  },
  {
    path: 'inquiries',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/manage-inquiries/manage-inquiries.component').then(
        (m) => m.ManageInquiriesComponent
      ),
  },
  {
    path: 'revenue',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/revenue-reports/revenue-reports.component').then(
        (m) => m.RevenueReportsComponent
      ),
  },
  {
    path: 'trainers',
    canActivate: [roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./pages/manage-trainers/manage-trainers.component').then(
        (m) => m.ManageTrainersComponent
      ),
  },
];
