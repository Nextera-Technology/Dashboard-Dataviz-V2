import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.role === 'operator') {
      return true;
    }
    
    // Redirect to dashboard if not operator
    this.router.navigate(['/dashboard']);
    return false;
  }
} 