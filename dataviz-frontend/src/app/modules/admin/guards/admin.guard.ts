import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '@dataviz/services/notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private notifier: NotificationService
  ) {}

  async canActivate(): Promise<boolean> {
    const currentUser = this.authService.getCurrentUser();
    
    // Check if user is authenticated
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // Only Super admin and Admtc director have full admin access
    if (this.authService.hasAdminAccess()) {
      return true;
    }
    
    // User does not have admin access - logout and show notification
    console.warn(`Access denied: User role "${currentUser.role}" does not have admin privileges`);
    
    // Logout user first (clear session)
    this.authService.logout();
    
    // Show error notification with proper title and message
    await this.notifier.errorKey('admin.access_denied').catch(() => {});
    
    // Redirect to login page (not dashboard)
    this.router.navigate(['/login']);
    return false;
  }
}