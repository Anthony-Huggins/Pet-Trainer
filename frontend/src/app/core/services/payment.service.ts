import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Payment,
  SessionPackage,
  ClientPackage,
  CheckoutResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly paymentsUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // --- Checkout ---

  createBookingCheckout(bookingId: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${this.paymentsUrl}/checkout/booking`,
      { bookingId }
    );
  }

  createPackageCheckout(packageId: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${this.paymentsUrl}/checkout/package`,
      { packageId }
    );
  }

  // --- Payment history ---

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.paymentsUrl}/my-payments`);
  }

  // --- Packages ---

  getPackages(): Observable<SessionPackage[]> {
    return this.http.get<SessionPackage[]>(`${this.paymentsUrl}/packages`);
  }

  getMyPackages(): Observable<ClientPackage[]> {
    return this.http.get<ClientPackage[]>(`${this.paymentsUrl}/my-packages`);
  }

  // --- Refunds ---

  refundPayment(paymentId: string): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.paymentsUrl}/${paymentId}/refund`,
      null
    );
  }
}
