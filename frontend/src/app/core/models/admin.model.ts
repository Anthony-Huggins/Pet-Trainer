import { Booking } from './booking.model';

export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrainers: number;
  newUsersThisMonth: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  recentActivity: Booking[];
}

export interface RevenueReport {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueByService: ServiceRevenue[];
  monthlyTrend: MonthlyRevenue[];
}

export interface ServiceRevenue {
  serviceName: string;
  total: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
}

export enum ContactInquiryStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  dogName?: string;
  serviceInterest?: string;
  status: ContactInquiryStatus;
  adminResponse?: string;
  createdAt: string;
}

export interface ReviewAdmin {
  id: string;
  clientId: string;
  clientName?: string;
  trainerId?: string;
  trainerName?: string;
  serviceTypeId?: string;
  serviceTypeName?: string;
  rating: number;
  title?: string;
  body?: string;
  featured: boolean;
  approved: boolean;
  createdAt: string;
}
