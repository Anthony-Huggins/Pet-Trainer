import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models';
import { WebSocketNotificationService } from './websocket-notification.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;
  private http = inject(HttpClient);
  private wsNotificationService = inject(WebSocketNotificationService);

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count`).pipe(
      tap(({ count }) => this.wsNotificationService.setUnreadCount(count))
    );
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/${id}/read`, null).pipe(
      tap(() => {
        this.wsNotificationService.decrementUnreadCount();
        this.wsNotificationService.markNotificationRead(id);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all`, null).pipe(
      tap(() => this.wsNotificationService.clearUnreadCount())
    );
  }
}
