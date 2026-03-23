import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notification } from '../../../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto py-10 px-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Notifications</h1>
          <p class="text-slate-500 mt-1">Stay up to date with your training activity.</p>
        </div>
        <div class="flex items-center gap-3">
          @if (unreadCount() > 0) {
            <span class="text-sm text-slate-500">{{ unreadCount() }} unread</span>
          }
          <button
            (click)="markAllRead()"
            class="px-4 py-2 rounded-lg text-sm font-medium text-[#0D7377] border border-[#0D7377] hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="unreadCount() === 0 || markingAll()"
          >
            {{ markingAll() ? 'Marking...' : 'Mark All Read' }}
          </button>
        </div>
      </div>

      <!-- Error State -->
      @if (error()) {
        <div class="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {{ error() }}
        </div>
      }

      <!-- Loading State -->
      @if (loading()) {
        <div class="mt-10 bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center">
          <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D7377]"></div>
          <p class="text-slate-500 mt-4">Loading notifications...</p>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && !error() && notifications().length === 0) {
        <div class="mt-10 bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center">
          <div class="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
            <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-700 mt-4">You're all caught up!</h3>
          <p class="text-slate-500 mt-2 max-w-sm mx-auto">
            No new notifications. We'll let you know when there's something important about your bookings, training, or account.
          </p>
        </div>
      }

      <!-- Notification List -->
      @if (!loading() && notifications().length > 0) {
        <div class="mt-8 space-y-3">
          @for (notification of notifications(); track notification.id) {
            <div
              (click)="markRead(notification)"
              class="bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
              [class]="notification.isRead
                ? 'border-slate-200'
                : 'border-slate-200 border-l-4 border-l-[#0D7377]'"
            >
              <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                   [class]="notification.isRead ? 'bg-slate-100' : 'bg-teal-50'">
                <svg class="h-5 w-5" [class]="notification.isRead ? 'text-slate-400' : 'text-[#0D7377]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between">
                  <h4 class="text-sm font-semibold" [class]="notification.isRead ? 'text-slate-500' : 'text-slate-800'">
                    {{ notification.title }}
                  </h4>
                  <span class="text-xs text-slate-400 shrink-0 ml-2">{{ timeAgo(notification.createdAt) }}</span>
                </div>
                <p class="text-sm mt-1" [class]="notification.isRead ? 'text-slate-400' : 'text-slate-500'">
                  {{ notification.message }}
                </p>
              </div>
              @if (!notification.isRead) {
                <div class="flex-shrink-0 mt-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#0D7377] block"></span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<Notification[]>([]);
  loading = signal(false);
  error = signal('');
  markingAll = signal(false);

  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.error.set('');
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load notifications.');
        this.loading.set(false);
      },
    });
  }

  markRead(notification: Notification): void {
    if (notification.isRead) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: (updated) => {
        this.notifications.update(list =>
          list.map(n => n.id === updated.id ? updated : n)
        );
      },
    });
  }

  markAllRead(): void {
    this.markingAll.set(true);
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, isRead: true }))
        );
        this.markingAll.set(false);
      },
      error: () => {
        this.markingAll.set(false);
      },
    });
  }

  timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
