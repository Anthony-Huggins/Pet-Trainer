import { Component, inject, signal, ElementRef, HostListener, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WebSocketNotificationService } from '../../../core/services/websocket-notification.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Bell Button -->
      <button
        (click)="toggleDropdown()"
        class="relative p-2 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
        aria-label="Notifications"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        @if (wsService.unreadCount() > 0) {
          <span
            class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          >
            {{ wsService.unreadCount() > 99 ? '99+' : wsService.unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown Panel -->
      @if (isOpen()) {
        <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 max-h-96 overflow-hidden z-50">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 class="text-sm font-semibold text-slate-700">Notifications</h3>
            @if (wsService.unreadCount() > 0) {
              <button
                (click)="markAllRead()"
                class="text-xs text-teal-600 hover:text-teal-800 font-medium transition"
              >
                Mark all as read
              </button>
            }
          </div>

          <!-- Notification List -->
          <div class="overflow-y-auto max-h-72">
            @if (notifications().length === 0) {
              <div class="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            } @else {
              @for (notification of notifications(); track notification.id) {
                <div
                  (click)="onNotificationClick(notification)"
                  class="px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition"
                  [class.bg-teal-50]="!notification.isRead"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 mt-0.5">
                      <span [class]="getIconClass(notification.type)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          @switch (notification.type) {
                            @case ('BOOKING_CONFIRMED') {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            }
                            @case ('BOOKING_CANCELLED') {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            }
                            @case ('PAYMENT_RECEIVED') {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            }
                            @case ('TRAINING_UPDATE') {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            }
                            @default {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            }
                          }
                        </svg>
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-800 truncate">{{ notification.title }}</p>
                      <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ notification.message }}</p>
                      <p class="text-xs text-slate-400 mt-1">{{ timeAgo(notification.createdAt) }}</p>
                    </div>
                    @if (!notification.isRead) {
                      <div class="flex-shrink-0 mt-1">
                        <span class="block w-2 h-2 bg-teal-500 rounded-full"></span>
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="px-4 py-2 border-t border-slate-200 bg-slate-50">
            <button
              (click)="viewAll()"
              class="w-full text-center text-xs text-teal-600 hover:text-teal-800 font-medium py-1 transition"
            >
              View All Notifications
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  wsService = inject(WebSocketNotificationService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isOpen = signal(false);
  notifications = signal<Notification[]>([]);

  private loadedInitial = false;

  ngOnInit(): void {
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown(): void {
    const opening = !this.isOpen();
    this.isOpen.set(opening);
    if (opening) {
      this.loadNotifications();
    }
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => this.notifications.set(notifications),
    });
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
      this.notifications.update(list =>
        list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }

    this.isOpen.set(false);

    if (notification.data?.['link']) {
      this.router.navigateByUrl(notification.data['link'] as string);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, isRead: true }))
        );
      },
    });
  }

  viewAll(): void {
    this.isOpen.set(false);
    this.router.navigate(['/dashboard/notifications']);
  }

  getIconClass(type: string): string {
    const baseClass = 'flex items-center justify-center w-8 h-8 rounded-full';
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return `${baseClass} bg-green-100 text-green-600`;
      case 'BOOKING_CANCELLED':
        return `${baseClass} bg-red-100 text-red-600`;
      case 'PAYMENT_RECEIVED':
        return `${baseClass} bg-yellow-100 text-yellow-600`;
      case 'TRAINING_UPDATE':
        return `${baseClass} bg-blue-100 text-blue-600`;
      default:
        return `${baseClass} bg-slate-100 text-slate-600`;
    }
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }
}
