import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactInquiry {
  name: string;
  email: string;
  phone?: string;
  serviceInterest: string;
  dogName?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  submitInquiry(data: ContactInquiry): Observable<void> {
    return this.http.post<void>(this.apiUrl, data);
  }
}
