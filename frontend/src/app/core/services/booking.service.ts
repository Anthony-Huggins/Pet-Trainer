import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Booking,
  BookingRequest,
  ClassEnrollment,
  ClassEnrollmentRequest,
  ClassSeries,
} from '../models';

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly bookingsUrl = `${environment.apiUrl}/bookings`;
  private readonly schedulingUrl = `${environment.apiUrl}/scheduling`;
  private readonly paymentsUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // --- Private session bookings ---

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.bookingsUrl);
  }

  getBooking(bookingId: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.bookingsUrl}/${bookingId}`);
  }

  createBooking(request: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.bookingsUrl, request);
  }

  checkoutBooking(bookingId: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.paymentsUrl}/checkout/booking`, { bookingId });
  }

  cancelBooking(bookingId: string, reason?: string): Observable<Booking> {
    const options = reason ? { params: { reason } } : {};
    return this.http.post<Booking>(
      `${this.bookingsUrl}/${bookingId}/cancel`,
      null,
      options
    );
  }

  // --- Class enrollments ---

  getMyEnrollments(): Observable<ClassEnrollment[]> {
    return this.http.get<ClassEnrollment[]>(
      `${this.bookingsUrl}/enrollments`
    );
  }

  enrollInClass(request: ClassEnrollmentRequest): Observable<ClassEnrollment> {
    return this.http.post<ClassEnrollment>(
      `${this.bookingsUrl}/enrollments`,
      request
    );
  }

  dropEnrollment(enrollmentId: string): Observable<ClassEnrollment> {
    return this.http.delete<ClassEnrollment>(
      `${this.bookingsUrl}/enrollments/${enrollmentId}`
    );
  }

  // --- Class schedule (public) ---

  getUpcomingClasses(): Observable<ClassSeries[]> {
    return this.http.get<ClassSeries[]>(
      `${this.schedulingUrl}/class-series`
    );
  }

  getClassSeries(classSeriesId: string): Observable<ClassSeries> {
    return this.http.get<ClassSeries>(
      `${this.schedulingUrl}/class-series/${classSeriesId}`
    );
  }
}
