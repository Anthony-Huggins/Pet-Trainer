import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AvailableSlot,
  ClassSeries,
  ClassSeriesRequest,
  Session,
  SessionRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class SchedulingService {
  private readonly baseUrl = `${environment.apiUrl}/scheduling`;

  constructor(private http: HttpClient) {}

  // --- Public: class series ---

  getUpcomingClasses(): Observable<ClassSeries[]> {
    return this.http.get<ClassSeries[]>(`${this.baseUrl}/class-series`);
  }

  getClassSeries(classSeriesId: string): Observable<ClassSeries> {
    return this.http.get<ClassSeries>(
      `${this.baseUrl}/class-series/${classSeriesId}`
    );
  }

  getClassSeriesSessions(classSeriesId: string): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.baseUrl}/class-series/${classSeriesId}/sessions`
    );
  }

  // --- Public: available slots ---

  getAvailableSlots(
    trainerId: string,
    serviceTypeId: string,
    from: string,
    to: string
  ): Observable<AvailableSlot[]> {
    const params = new HttpParams()
      .set('trainerId', trainerId)
      .set('serviceTypeId', serviceTypeId)
      .set('from', from)
      .set('to', to);
    return this.http.get<AvailableSlot[]>(
      `${this.baseUrl}/available-slots`,
      { params }
    );
  }

  // --- Authenticated: session details ---

  getSession(sessionId: string): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/sessions/${sessionId}`);
  }

  getSessionsByTrainer(
    trainerId: string,
    from: string,
    to: string
  ): Observable<Session[]> {
    const params = new HttpParams()
      .set('trainerId', trainerId)
      .set('from', from)
      .set('to', to);
    return this.http.get<Session[]>(`${this.baseUrl}/sessions`, { params });
  }

  // --- Admin/Trainer: create ---

  createSession(request: SessionRequest): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/sessions`, request);
  }

  cancelSession(sessionId: string): Observable<Session> {
    return this.http.post<Session>(
      `${this.baseUrl}/sessions/${sessionId}/cancel`,
      null
    );
  }

  createClassSeries(request: ClassSeriesRequest): Observable<ClassSeries> {
    return this.http.post<ClassSeries>(
      `${this.baseUrl}/class-series`,
      request
    );
  }
}
