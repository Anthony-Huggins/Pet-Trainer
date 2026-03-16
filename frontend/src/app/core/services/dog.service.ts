import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Dog,
  DogRequest,
  DogVaccination,
  DogVaccinationRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class DogService {
  private readonly apiUrl = `${environment.apiUrl}/dogs`;

  constructor(private http: HttpClient) {}

  getMyDogs(): Observable<Dog[]> {
    return this.http.get<Dog[]>(this.apiUrl);
  }

  getDog(dogId: string): Observable<Dog> {
    return this.http.get<Dog>(`${this.apiUrl}/${dogId}`);
  }

  createDog(request: DogRequest): Observable<Dog> {
    return this.http.post<Dog>(this.apiUrl, request);
  }

  updateDog(dogId: string, request: DogRequest): Observable<Dog> {
    return this.http.put<Dog>(`${this.apiUrl}/${dogId}`, request);
  }

  deleteDog(dogId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dogId}`);
  }

  // --- Vaccinations ---

  getVaccinations(dogId: string): Observable<DogVaccination[]> {
    return this.http.get<DogVaccination[]>(
      `${this.apiUrl}/${dogId}/vaccinations`
    );
  }

  addVaccination(
    dogId: string,
    request: DogVaccinationRequest
  ): Observable<DogVaccination> {
    return this.http.post<DogVaccination>(
      `${this.apiUrl}/${dogId}/vaccinations`,
      request
    );
  }

  deleteVaccination(dogId: string, vaccinationId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${dogId}/vaccinations/${vaccinationId}`
    );
  }
}
