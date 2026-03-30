import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'pf_access_token';

  private currentUser = signal<User | null>(null);
  private accessToken = signal<string | null>(null);
  private _initialized = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly initialized = this._initialized.asReadonly();

  /** Resolves once the session restore attempt is complete */
  readonly whenInitialized: Promise<void>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.whenInitialized = this.restoreSession();
  }

  private async restoreSession(): Promise<void> {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    if (savedToken) {
      this.accessToken.set(savedToken);
      try {
        await firstValueFrom(this.getCurrentUser());
      } catch {
        // Token expired — try refresh token (httpOnly cookie)
        try {
          await firstValueFrom(this.refreshToken());
        } catch {
          this.clearAuth();
        }
      }
    }
    this._initialized.set(true);
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  refreshToken(): Observable<AuthResponse | null> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError(() => {
          this.clearAuth();
          return of(null);
        })
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          this.clearAuth();
          this.router.navigate(['/']);
        },
        error: () => {
          this.clearAuth();
          this.router.navigate(['/']);
        },
      });
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  handleOAuthCallback(token: string, refreshToken: string): void {
    this.accessToken.set(token);
    localStorage.setItem(this.TOKEN_KEY, token);
    this.getCurrentUser().subscribe();
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.accessToken.set(response.accessToken);
    this.currentUser.set(response.user);
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
  }

  private clearAuth(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
