import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserRole,
  TrainerProfile,
  Booking,
  BookingStatus,
  ClassSeries,
  PageResponse,
  DashboardStats,
  RevenueReport,
  ContactInquiry,
  ReviewAdmin,
} from '../models';

export interface CreateTrainerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  bio?: string;
  specializations?: string[];
  certifications?: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  acceptingClients?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // --- Dashboard ---

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  // --- Users ---

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(id: string, role: UserRole): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  updateUserStatus(id: string, enabled: boolean): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/status`, { enabled });
  }

  // --- Trainers ---

  getAllTrainers(): Observable<TrainerProfile[]> {
    return this.http.get<TrainerProfile[]>(`${this.apiUrl}/trainers`);
  }

  createTrainer(request: CreateTrainerRequest): Observable<TrainerProfile> {
    return this.http.post<TrainerProfile>(`${this.apiUrl}/trainers`, request);
  }

  // --- Bookings ---

  getAllBookings(status?: BookingStatus, page?: number, size?: number): Observable<PageResponse<Booking>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    return this.http.get<PageResponse<Booking>>(`${this.apiUrl}/bookings`, { params });
  }

  updateBookingStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/bookings/${id}/status`, { status });
  }

  // --- Classes ---

  getAllClasses(): Observable<ClassSeries[]> {
    return this.http.get<ClassSeries[]>(`${this.apiUrl}/classes`);
  }

  // --- Reviews ---

  getAllReviews(): Observable<ReviewAdmin[]> {
    return this.http.get<ReviewAdmin[]>(`${this.apiUrl}/reviews`);
  }

  approveReview(id: string): Observable<ReviewAdmin> {
    return this.http.put<ReviewAdmin>(`${this.apiUrl}/reviews/${id}/approve`, {});
  }

  rejectReview(id: string): Observable<ReviewAdmin> {
    return this.http.put<ReviewAdmin>(`${this.apiUrl}/reviews/${id}/reject`, {});
  }

  toggleFeaturedReview(id: string): Observable<ReviewAdmin> {
    return this.http.put<ReviewAdmin>(`${this.apiUrl}/reviews/${id}/feature`, {});
  }

  // --- Inquiries ---

  getAllInquiries(): Observable<ContactInquiry[]> {
    return this.http.get<ContactInquiry[]>(`${this.apiUrl}/inquiries`);
  }

  respondToInquiry(id: string, response: string): Observable<ContactInquiry> {
    return this.http.put<ContactInquiry>(`${this.apiUrl}/inquiries/${id}/respond`, { response });
  }

  archiveInquiry(id: string): Observable<ContactInquiry> {
    return this.http.put<ContactInquiry>(`${this.apiUrl}/inquiries/${id}/archive`, {});
  }

  // --- Revenue ---

  getRevenueReport(): Observable<RevenueReport> {
    return this.http.get<RevenueReport>(`${this.apiUrl}/revenue`);
  }
}
