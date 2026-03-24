import { Component, inject, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WebSocketNotificationService } from '../../../core/services/websocket-notification.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div
        class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border-l-4 border-teal-500 max-w-sm z-50 animate-slide-in cursor-pointer"
        (click)="onToastClick()"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800">{{ currentNotification()?.title }}</p>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ currentNotification()?.message }}</p>
          </div>
          <button
            (click)="dismiss($event)"
            class="flex-shrink-0 text-slate-400 hover:text-slate-600 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `],
})
export class NotificationToastComponent implements OnDestroy {
  private wsService = inject(WebSocketNotificationService);
  private router = inject(Router);
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  visible = signal(false);
  currentNotification = signal<Notification | null>(null);

  private toastEffect = effect(() => {
    const notification = this.wsService.latestNotification();
    if (notification) {
      this.showToast(notification);
    }
  });

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private showToast(notification: Notification): void {
    this.clearTimer();
    this.currentNotification.set(notification);
    this.visible.set(true);

    this.dismissTimer = setTimeout(() => {
      this.visible.set(false);
      this.wsService.clearLatestNotification();
    }, 5000);
  }

  onToastClick(): void {
    this.clearTimer();
    this.visible.set(false);

    const notification = this.currentNotification();
    if (notification?.data?.['link']) {
      this.router.navigateByUrl(notification.data['link'] as string);
    }

    this.wsService.clearLatestNotification();
  }

  dismiss(event: MouseEvent): void {
    event.stopPropagation();
    this.clearTimer();
    this.visible.set(false);
    this.wsService.clearLatestNotification();
  }

  private clearTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
