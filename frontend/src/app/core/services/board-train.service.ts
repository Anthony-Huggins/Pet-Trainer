import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BoardTrainProgram,
  BoardTrainRequest,
  DailyNote,
  DailyNoteRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class BoardTrainService {
  private readonly baseUrl = `${environment.apiUrl}/board-train`;

  constructor(private http: HttpClient) {}

  // --- Program requests ---

  createRequest(request: BoardTrainRequest): Observable<BoardTrainProgram> {
    return this.http.post<BoardTrainProgram>(this.baseUrl, request);
  }

  getMyPrograms(): Observable<BoardTrainProgram[]> {
    return this.http.get<BoardTrainProgram[]>(`${this.baseUrl}/my-programs`);
  }

  getTrainerPrograms(): Observable<BoardTrainProgram[]> {
    return this.http.get<BoardTrainProgram[]>(
      `${this.baseUrl}/trainer-programs`
    );
  }

  getById(id: string): Observable<BoardTrainProgram> {
    return this.http.get<BoardTrainProgram>(`${this.baseUrl}/${id}`);
  }

  // --- Program management ---

  assignTrainer(id: string, trainerId: string): Observable<BoardTrainProgram> {
    return this.http.put<BoardTrainProgram>(
      `${this.baseUrl}/${id}/assign-trainer`,
      { trainerId }
    );
  }

  updateStatus(id: string, status: string): Observable<BoardTrainProgram> {
    return this.http.put<BoardTrainProgram>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );
  }

  // --- Daily notes ---

  addDailyNote(id: string, note: DailyNoteRequest): Observable<DailyNote> {
    return this.http.post<DailyNote>(
      `${this.baseUrl}/${id}/daily-notes`,
      note
    );
  }

  getDailyNotes(id: string): Observable<DailyNote[]> {
    return this.http.get<DailyNote[]>(`${this.baseUrl}/${id}/daily-notes`);
  }
}
