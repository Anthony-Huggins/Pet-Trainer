import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto py-10 px-6">
      <h1 class="text-3xl font-bold text-slate-800 mb-8">Profile Settings</h1>

      <!-- Tabs -->
      <div class="flex border-b border-slate-200 mb-8">
        <button
          (click)="activeTab.set('profile')"
          [class]="activeTab() === 'profile'
            ? 'px-6 py-3 text-sm font-semibold border-b-2 border-[#0D7377] text-[#0D7377]'
            : 'px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700'"
        >
          Profile
        </button>
        <button
          (click)="activeTab.set('security')"
          [class]="activeTab() === 'security'
            ? 'px-6 py-3 text-sm font-semibold border-b-2 border-[#0D7377] text-[#0D7377]'
            : 'px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700'"
        >
          Security
        </button>
      </div>

      <!-- Success Message -->
      @if (successMessage()) {
        <div class="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
          <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-emerald-700 text-sm font-medium">{{ successMessage() }}</span>
        </div>
      }

      <!-- Profile Tab -->
      @if (activeTab() === 'profile') {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <!-- Avatar -->
          <div class="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div class="w-20 h-20 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {{ initials() }}
            </div>
            <div>
              <p class="text-lg font-semibold text-slate-800">{{ user()?.firstName }} {{ user()?.lastName }}</p>
              <p class="text-sm text-slate-500">{{ user()?.email }}</p>
            </div>
          </div>

          <!-- Profile Form -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
              <input
                type="text"
                [value]="firstName()"
                (input)="firstName.set(asInputValue($event))"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
              <input
                type="text"
                [value]="lastName()"
                (input)="lastName.set(asInputValue($event))"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                [value]="user()?.email ?? ''"
                disabled
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-400 cursor-not-allowed"
              />
              <p class="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input
                type="tel"
                [value]="phone()"
                (input)="phone.set(asInputValue($event))"
                placeholder="(555) 123-4567"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
              />
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button
              (click)="saveProfile()"
              [disabled]="saving()"
              class="px-6 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      }

      <!-- Security Tab -->
      @if (activeTab() === 'security') {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 class="text-xl font-semibold text-slate-800 mb-6">Change Password</h2>

          <div class="max-w-md space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                [value]="currentPassword()"
                (input)="currentPassword.set(asInputValue($event))"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                [value]="newPassword()"
                (input)="newPassword.set(asInputValue($event))"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
              />
              <!-- Strength Meter -->
              @if (newPassword()) {
                <div class="mt-2">
                  <div class="flex gap-1.5">
                    @for (i of [0, 1, 2, 3]; track i) {
                      <div
                        class="h-1.5 flex-1 rounded-full transition-colors"
                        [class]="i < passwordStrength()
                          ? strengthColors()[passwordStrength() - 1]
                          : 'bg-slate-200'"
                      ></div>
                    }
                  </div>
                  <p class="text-xs mt-1" [class]="strengthTextColors()[passwordStrength() - 1]">
                    {{ strengthLabels()[passwordStrength() - 1] }}
                  </p>
                </div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                [value]="confirmPassword()"
                (input)="confirmPassword.set(asInputValue($event))"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
              />
              @if (confirmPassword() && newPassword() !== confirmPassword()) {
                <p class="text-xs text-red-500 mt-1">Passwords do not match</p>
              }
            </div>

            <div class="pt-3">
              <button
                (click)="updatePassword()"
                [disabled]="savingPassword() || !currentPassword() || !newPassword() || newPassword() !== confirmPassword()"
                class="px-6 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingPassword() ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProfileSettingsComponent implements OnInit {
  private authService = inject(AuthService);

  readonly user = this.authService.user;

  activeTab = signal<'profile' | 'security'>('profile');
  successMessage = signal('');

  firstName = signal('');
  lastName = signal('');
  phone = signal('');
  saving = signal(false);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  savingPassword = signal(false);

  initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  });

  passwordStrength = computed(() => {
    const pw = this.newPassword();
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.max(1, Math.min(4, score));
  });

  strengthColors = signal(['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500']);
  strengthTextColors = signal(['text-red-500', 'text-orange-500', 'text-amber-500', 'text-emerald-600']);
  strengthLabels = signal(['Weak', 'Fair', 'Good', 'Strong']);

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.firstName.set(u.firstName ?? '');
      this.lastName.set(u.lastName ?? '');
      this.phone.set(u.phone ?? '');
    }
  }

  asInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  saveProfile(): void {
    this.saving.set(true);
    this.successMessage.set('');

    // Simulate save -- replace with real HTTP call when endpoint exists
    setTimeout(() => {
      this.saving.set(false);
      this.successMessage.set('Profile updated successfully.');
      setTimeout(() => this.successMessage.set(''), 4000);
    }, 600);
  }

  updatePassword(): void {
    this.savingPassword.set(true);
    this.successMessage.set('');

    // Simulate save -- replace with real HTTP call when endpoint exists
    setTimeout(() => {
      this.savingPassword.set(false);
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.successMessage.set('Password updated successfully.');
      setTimeout(() => this.successMessage.set(''), 4000);
    }, 600);
  }
}
