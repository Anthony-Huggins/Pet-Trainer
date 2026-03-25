import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, ReviewRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getApprovedReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  getReviewsForTrainer(trainerId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/trainer/${trainerId}`);
  }

  getReviewsForServiceType(serviceTypeId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/service/${serviceTypeId}`);
  }

  submitReview(review: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }
}
