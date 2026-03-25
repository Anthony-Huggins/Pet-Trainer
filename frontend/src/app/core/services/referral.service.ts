import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReferralCode, ReferralDashboard } from '../models';

@Injectable({ providedIn: 'root' })
export class ReferralService {
  private readonly apiUrl = `${environment.apiUrl}/referrals`;

  constructor(private http: HttpClient) {}

  getMyReferralCode(): Observable<ReferralCode> {
    return this.http.get<ReferralCode>(`${this.apiUrl}/my-code`);
  }

  getReferralDashboard(): Observable<ReferralDashboard> {
    return this.http.get<ReferralDashboard>(`${this.apiUrl}/dashboard`);
  }

  validateCode(code: string): Observable<ReferralCode> {
    return this.http.get<ReferralCode>(`${this.apiUrl}/validate/${code}`);
  }

  redeemCode(
    code: string,
    paymentId?: string,
    discountApplied?: number
  ): Observable<void> {
    const params: Record<string, string> = {};
    if (paymentId) params['paymentId'] = paymentId;
    if (discountApplied !== undefined)
      params['discountApplied'] = discountApplied.toString();
    return this.http.post<void>(`${this.apiUrl}/redeem`, null, {
      params: { code, ...params },
    });
  }
}
