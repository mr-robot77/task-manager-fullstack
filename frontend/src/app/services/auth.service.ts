import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'jwt_token';
  private isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(
      `${this.apiUrl}/register`,
      payload
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login_check`,
      { email, password }
    ).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        this.isLoggedIn$.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  private hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.tokenKey);
  }
}
