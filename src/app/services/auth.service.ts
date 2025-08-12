import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  roles?: any[];
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_BASE_URL = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();



  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const user = this.getCurrentUserFromStorage();
    const isValid = this.hasValidToken();

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isValid);

    if (!isValid && user) {
      this.forceLogout();
    }
  }

  private getCurrentUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('AuthService - No access token found');
      return false;
    }

    // Check token expiration logic here (optional)
    const tokenTimestamp = localStorage.getItem('token_timestamp');
    if (!tokenTimestamp) {
      console.log('AuthService - No token timestamp found');
      return false;
    }

    const tokenDate = new Date(parseInt(tokenTimestamp));
    const now = new Date();

    // Token valid for 24 hours
    const diffHours = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60);
    const isValid = diffHours < 24;

    console.log('AuthService - Token validation:', {
      token: token ? 'exists' : 'missing',
      timestamp: tokenTimestamp,
      diffHours,
      isValid
    });

    return isValid;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = `${this.API_BASE_URL}/login`;

    try {
      const response = await firstValueFrom(this.http.post<LoginResponse>(url, credentials));

      // Store authentication data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('token_type', response.token_type || 'Bearer');
      localStorage.setItem('token_timestamp', Date.now().toString());
      localStorage.setItem('user', JSON.stringify(response.user));

      // Update subjects
      this.currentUserSubject.next(response.user);
      this.isAuthenticatedSubject.next(true);

      return response;

    } catch (error: any) {
      console.error('Login error:', error);
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
      throw new Error(error?.error?.message || 'Login failed');
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('user');

    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);

    this.router.navigate(['/admin/login']);
  }

  isLoggedIn(): boolean {
    const isLoggedIn = this.isAuthenticatedSubject.value;
    console.log('AuthService - isLoggedIn():', isLoggedIn);
    return isLoggedIn;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  forceLogout(): void {
    this.logout();
  }


}