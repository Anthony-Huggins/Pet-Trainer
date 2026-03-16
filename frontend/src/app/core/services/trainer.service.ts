import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TrainerProfile,
  TrainerProfileRequest,
  TrainerAvailability,
  TrainerAvailabilityRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class TrainerService {
  private readonly apiUrl = `${environment.apiUrl}/trainers`;

  constructor(private http: HttpClient) {}

  // --- Public ---

  getTrainers(): Observable<TrainerProfile[]> {
    return this.http.get<TrainerProfile[]>(this.apiUrl);
  }

  getTrainer(trainerId: string): Observable<TrainerProfile> {
    return this.http.get<TrainerProfile>(`${this.apiUrl}/${trainerId}`);
  }

  getTrainerAvailability(
    trainerId: string
  ): Observable<TrainerAvailability[]> {
    return this.http.get<TrainerAvailability[]>(
      `${this.apiUrl}/${trainerId}/availability`
    );
  }

  // --- Trainer self-management ---

  getMyProfile(): Observable<TrainerProfile> {
    return this.http.get<TrainerProfile>(`${this.apiUrl}/me/profile`);
  }

  updateMyProfile(request: TrainerProfileRequest): Observable<TrainerProfile> {
    return this.http.put<TrainerProfile>(
      `${this.apiUrl}/me/profile`,
      request
    );
  }

  getMyAvailability(): Observable<TrainerAvailability[]> {
    return this.http.get<TrainerAvailability[]>(
      `${this.apiUrl}/me/availability`
    );
  }

  addAvailability(
    request: TrainerAvailabilityRequest
  ): Observable<TrainerAvailability> {
    return this.http.post<TrainerAvailability>(
      `${this.apiUrl}/me/availability`,
      request
    );
  }

  deleteAvailability(availabilityId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/me/availability/${availabilityId}`
    );
  }

  // --- Admin ---

  createTrainerProfile(
    userId: string,
    request: TrainerProfileRequest
  ): Observable<TrainerProfile> {
    return this.http.post<TrainerProfile>(
      `${this.apiUrl}/${userId}/profile`,
      request
    );
  }
}
