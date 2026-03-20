import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TrainingGoal,
  TrainingGoalRequest,
  TrainingLog,
  TrainingLogRequest,
  DogProgressResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly goalsUrl = `${environment.apiUrl}/training/goals`;
  private readonly logsUrl = `${environment.apiUrl}/training/logs`;
  private readonly progressUrl = `${environment.apiUrl}/training/progress`;

  constructor(private http: HttpClient) {}

  // --- Training goals ---

  createGoal(request: TrainingGoalRequest): Observable<TrainingGoal> {
    return this.http.post<TrainingGoal>(this.goalsUrl, request);
  }

  getGoalsForDog(dogId: string): Observable<TrainingGoal[]> {
    return this.http.get<TrainingGoal[]>(`${this.goalsUrl}/dog/${dogId}`);
  }

  updateGoal(id: string, request: TrainingGoalRequest): Observable<TrainingGoal> {
    return this.http.put<TrainingGoal>(`${this.goalsUrl}/${id}`, request);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.goalsUrl}/${id}`);
  }

  // --- Training logs ---

  createLog(request: TrainingLogRequest): Observable<TrainingLog> {
    return this.http.post<TrainingLog>(this.logsUrl, request);
  }

  getLogsForDog(dogId: string): Observable<TrainingLog[]> {
    return this.http.get<TrainingLog[]>(`${this.logsUrl}/dog/${dogId}`);
  }

  getTrainerLogs(): Observable<TrainingLog[]> {
    return this.http.get<TrainingLog[]>(`${this.logsUrl}/trainer`);
  }

  getLogById(id: string): Observable<TrainingLog> {
    return this.http.get<TrainingLog>(`${this.logsUrl}/${id}`);
  }

  // --- Progress ---

  getDogProgress(dogId: string): Observable<DogProgressResponse> {
    return this.http.get<DogProgressResponse>(
      `${this.progressUrl}/dog/${dogId}`
    );
  }
}
