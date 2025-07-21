import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo-container">
          <img 
            src="https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/Nextera%20Logo%20Career%20Insight%20White%20text.png"
            alt="Nextera Logo"
          />
        </div>

        <!-- User Info -->
        <div class="user-info">
          <div class="user-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="user-details">
            <p class="user-name">{{ currentUser?.name }}</p>
            <p class="user-email">{{ currentUser?.email }}</p>
            <p class="user-role">{{ currentUser?.role | titlecase }}</p>
          </div>
        </div>

        <!-- Admin Navigation -->
        <div class="admin-nav">
          <div class="section-title">
            <span class="section-icon">⚙️</span>
            Administration
          </div>
          <div class="nav-menu">
            <a routerLink="/admin/dashboard-list" routerLinkActive="active" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard Builder</span>
            </a>
            <a routerLink="/admin/user-management" routerLinkActive="active" class="nav-item">
              <mat-icon>people</mat-icon>
              <span>User Management</span>
            </a>
          </div>
        </div>

        <!-- Back to Dashboard -->
        <div class="back-to-dashboard">
          <a routerLink="/dashboard" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            <span>View Dashboard</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="admin-header">
          <div class="header-content">
            <h1>{{ pageTitle }}</h1>
            <p class="breadcrumb">{{ breadcrumb }}</p>
          </div>
          
          <!-- User Menu -->
          <div class="user-menu">
            <button 
              mat-icon-button 
              [matMenuTriggerFor]="userMenu"
              class="user-menu-button"
            >
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="menu-header">
                <p class="menu-name">{{ currentUser?.name }}</p>
                <p class="menu-email">{{ currentUser?.email }}</p>
                <p class="menu-role">{{ currentUser?.role | titlecase }}</p>
              </div>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter';
      background: #F5F8FA;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 240px;
      height: 100vh;
      background: linear-gradient(135deg, #97cce4 0%, #306e8b 100%);
      color: white;
      padding: 20px;
      overflow-y: auto;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    /* Logo Container */
    .logo-container {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .logo-container img {
      max-width: 200px;
      height: auto;
    }

    /* User Info */
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 25px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-avatar mat-icon {
      color: white;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 2px 0;
      color: white;
    }

    .user-email {
      font-size: 12px;
      margin: 0 0 2px 0;
      color: rgba(255, 255, 255, 0.8);
    }

    .user-role {
      font-size: 11px;
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      text-transform: capitalize;
    }

    /* Admin Navigation */
    .admin-nav {
      flex: 1;
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-icon {
      font-size: 18px;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: white;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
    color: #f8fafc;
    border-left: 3px solid #ffffff;
    font-weight: 600;
    }

    .nav-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .nav-item span {
      flex: 1;
    }

    /* Back to Dashboard */
    .back-to-dashboard {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: white;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .back-link:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(4px);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .back-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 240px;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .admin-header {
      background: white;
      padding: 20px 30px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .breadcrumb {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    /* User Menu */
    .user-menu {
      position: relative;
    }

    .user-menu-button {
      color: #333;
    }

    .menu-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .menu-name {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #333;
    }

    .menu-email {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 12px;
    }

    .menu-role {
      margin: 0;
      color: #999;
      font-size: 11px;
      text-transform: capitalize;
    }

    /* Page Content */
    .page-content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .sidebar {
        width: 240px;
      }

      .main-content {
        margin-left: 240px;
      }
    }

    @media (max-width: 640px) {
      .sidebar {
        width: 100%;
        height: auto;
        position: relative;
      }

      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  currentUser: User | null = null;
  pageTitle: string = 'Admin Dashboard';
  breadcrumb: string = 'Administration';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Set page title and breadcrumb based on current route
    this.updatePageInfo();
  }

  updatePageInfo(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/admin/users')) {
      this.pageTitle = 'User Management';
      this.breadcrumb = 'Administration / Users';
    } else if (currentUrl.includes('/admin/widgets')) {
      this.pageTitle = 'Widget Settings';
      this.breadcrumb = 'Administration / Widgets';
    } else if (currentUrl.includes('/admin/sections')) {
      this.pageTitle = 'Section Settings';
      this.breadcrumb = 'Administration / Sections';
    }
  }

  logout(): void {
    this.authService.logout();
    this.snackBar.open('Logged out successfully', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.router.navigate(['/auth/login']);
  }
} 