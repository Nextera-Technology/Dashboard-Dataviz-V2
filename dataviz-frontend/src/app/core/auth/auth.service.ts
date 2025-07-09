import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  name: string;
  email: string;
  password: string;
  role: 'operator' | 'visitor';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Static dummy users
  private readonly dummyUsers: User[] = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'operator'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'visitor'
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'operator'
    }
  ];

  constructor() {
    this.loadUserFromSession();
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<User> {
    const user = this.dummyUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      // Simulate API delay
      return of(user).pipe(
        delay(1000),
        tap(user => {
          this.setCurrentUser(user);
        })
      );
    } else {
      // Return an error observable instead of throwing
      return throwError(() => new Error('Invalid email or password'));
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.currentUserSubject.next(null);
    sessionStorage.removeItem('currentUser');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has operator role
   */
  isOperator(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'operator';
  }

  /**
   * Check if user has visitor role
   */
  isVisitor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'visitor';
  }

  /**
   * Set current user and save to session storage
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Load user from session storage on app initialization
   */
  private loadUserFromSession(): void {
    const userStr = sessionStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading user from session:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
  }
} 