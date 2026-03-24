import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';
import { Notification } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketNotificationService implements OnDestroy {
  private client: Client | null = null;
  private authService = inject(AuthService);

  private _notifications = signal<Notification[]>([]);
  private _unreadCount = signal<number>(0);
  private _connected = signal<boolean>(false);
  private _latestNotification = signal<Notification | null>(null);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly connected = this._connected.asReadonly();
  readonly latestNotification = this._latestNotification.asReadonly();

  connect(): void {
    const token = this.authService.getAccessToken();
    if (!token || this.client?.active) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this._connected.set(true);
        this.client?.subscribe('/user/queue/notifications', (message: IMessage) => {
          const notification: Notification = JSON.parse(message.body);
          this._notifications.update(list => [notification, ...list]);
          this._unreadCount.update(c => c + 1);
          this._latestNotification.set(notification);
        });
      },
      onDisconnect: () => {
        this._connected.set(false);
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame.headers['message']);
        this._connected.set(false);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
    this._connected.set(false);
    this._notifications.set([]);
    this._unreadCount.set(0);
    this._latestNotification.set(null);
  }

  setUnreadCount(count: number): void {
    this._unreadCount.set(count);
  }

  decrementUnreadCount(): void {
    this._unreadCount.update(c => Math.max(0, c - 1));
  }

  clearUnreadCount(): void {
    this._unreadCount.set(0);
  }

  markNotificationRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }

  clearLatestNotification(): void {
    this._latestNotification.set(null);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
