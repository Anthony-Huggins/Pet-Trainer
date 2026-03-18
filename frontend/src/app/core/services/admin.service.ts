import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, TrainerProfile } from '../models';

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

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getAllTrainers(): Observable<TrainerProfile[]> {
    return this.http.get<TrainerProfile[]>(`${this.apiUrl}/trainers`);
  }

  createTrainer(request: CreateTrainerRequest): Observable<TrainerProfile> {
    return this.http.post<TrainerProfile>(`${this.apiUrl}/trainers`, request);
  }
}
