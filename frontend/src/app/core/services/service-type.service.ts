import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceType, ServiceCategory, ServiceTypeRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ServiceTypeService {
  private readonly apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getServices(category?: ServiceCategory): Observable<ServiceType[]> {
    const params = category ? { category } : {};
    return this.http.get<ServiceType[]>(this.apiUrl, { params });
  }

  getService(serviceId: string): Observable<ServiceType> {
    return this.http.get<ServiceType>(`${this.apiUrl}/${serviceId}`);
  }

  // --- Admin ---

  getAllServices(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${this.apiUrl}/admin/all`);
  }

  createService(request: ServiceTypeRequest): Observable<ServiceType> {
    return this.http.post<ServiceType>(this.apiUrl, request);
  }

  updateService(
    serviceId: string,
    request: ServiceTypeRequest
  ): Observable<ServiceType> {
    return this.http.put<ServiceType>(`${this.apiUrl}/${serviceId}`, request);
  }

  deleteService(serviceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${serviceId}`);
  }
}
