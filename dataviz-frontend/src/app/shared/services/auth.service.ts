import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock users for demonstration
  private users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@rdc.cd', role: 'Admin' },
    { id: '2', name: 'Manager User', email: 'manager@rdc.cd', role: 'Manager' },
    { id: '3', name: 'Analyst User', email: 'analyst@rdc.cd', role: 'Analyst' }
  ];

  constructor() {
    // Check if user is already logged in
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<{ success: boolean; error?: string; user?: User }> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        const user = this.users.find(u => u.email === email);
        
        if (user && password === 'password') { // Simple password check for demo
          this.currentUserSubject.next(user);
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          observer.next({ success: true, user });
        } else {
          observer.next({ 
            success: false, 
            error: 'Invalid email or password' 
          });
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    sessionStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
} 