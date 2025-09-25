import { Component, OnInit, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { NotificationService } from '../../../../../@dataviz/services/notification/notification.service';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/auth/auth.service';
import { QuickSearchComponent } from '../../../../shared/components/quick-search/quick-search.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslatePipe,
    QuickSearchComponent
  ],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <div class="logo-container">
          <img 
            src="https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/Nextera%20Logo%20Career%20Insight%20White%20text.png"
            alt="Nextera Logo"
          />
        </div>

        <!-- Toggle Button - positioned above user info -->
        <div class="sidebar-toggle-section">
          <button (click)="toggleSidebar()" class="toggle-btn" [attr.aria-label]="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
            <mat-icon>{{ isSidebarCollapsed ? 'menu' : 'menu_open' }}</mat-icon>
          </button>
        </div>

        <!-- User Info -->
        <div class="user-info">
          <div class="user-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="user-details" *ngIf="!isSidebarCollapsed">
            <p class="user-name">{{ currentUser?.name }}</p>
            <p class="user-email">{{ currentUser?.email }}</p>
            <p class="user-role">{{ currentUser?.role | titlecase }}</p>
          </div>
        </div>

        <!-- Admin Navigation -->
        <div class="admin-nav" *ngIf="!isSidebarCollapsed">
          <div class="section-title">
            <span class="section-icon">⚙️</span>
            {{ 'admin.layout.title' | translate }}
          </div>
          <div class="nav-menu">
            <!-- Dashboard Builder with Sub-menu -->
            <div class="nav-item-group">
              <div class="nav-item" 
                   [class.expanded]="isDashboardBuilderExpanded" 
                   (click)="toggleDashboardBuilderMenu()">
                <mat-icon>dashboard</mat-icon>
                <span>{{ 'admin.dashboardList.header_title' | translate }}</span>
                <mat-icon class="expand-icon">{{ isDashboardBuilderExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              
              <!-- Dashboard Builder Sub-menu -->
              <div class="sub-menu" *ngIf="isDashboardBuilderExpanded">
                <a routerLink="/admin/dashboard-list" routerLinkActive="active" class="sub-nav-item">
                  <mat-icon>view_module</mat-icon>
                  <span>Dashboard Card</span>
                </a>
                <a routerLink="/admin/dashboard-create" routerLinkActive="active" class="sub-nav-item">
                  <mat-icon>add_circle</mat-icon>
                  <span>Add New Dashboard</span>
                </a>
                <a routerLink="/admin/dashboard-table" routerLinkActive="active" class="sub-nav-item">
                  <mat-icon>table_view</mat-icon>
                  <span>Table of Dashboard</span>
                </a>
              </div>
            </div>

            <!-- Job Description with Sub-menu -->
            <div class="nav-item-group">
              <div class="nav-item" 
                   [class.expanded]="isJobDescriptionExpanded" 
                   (click)="toggleJobDescriptionMenu()">
                <mat-icon>work</mat-icon>
                <span>{{ 'admin.layout.jobDescription' | translate }}</span>
                <mat-icon class="expand-icon">{{ isJobDescriptionExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              
              <!-- Job Description Sub-menu -->
              <div class="sub-menu" *ngIf="isJobDescriptionExpanded">
                <a routerLink="/admin/job-description" routerLinkActive="active" class="sub-nav-item">
                  <mat-icon>view_module</mat-icon>
                  <span>Dashboard Card</span>
                </a>
                <a routerLink="/admin/job-description-create" routerLinkActive="active" class="sub-nav-item">
                  <mat-icon>add_circle</mat-icon>
                  <span>Add New Dashboard</span>
                </a>
                <a routerLink="/admin/job-description-table" routerLinkActive="active" class="sub-nav-item">
                  <mat-icon>table_view</mat-icon>
                  <span>Table of Dashboard</span>
                </a>
              </div>
            </div>

            <!-- User Management (no sub-menu) -->
            <a routerLink="/admin/user-management" routerLinkActive="active" class="nav-item">
              <mat-icon>people</mat-icon>
              <span>{{ 'admin.layout.userManagement' | translate }}</span>
            </a>
          </div>
        </div>

        <!-- Collapsed Icon Menu -->
        <div class="collapsed-menu" *ngIf="isSidebarCollapsed">
          <!-- Admin Dashboard Icon -->
          <a routerLink="/admin/dashboard-list" routerLinkActive="active" class="collapsed-menu-item" 
             [matTooltip]="'admin.dashboardList.header_title' | translate" matTooltipPosition="right">
            <mat-icon>dashboard</mat-icon>
          </a>

          <!-- Job Description Icon -->
          <a routerLink="/admin/job-description" routerLinkActive="active" class="collapsed-menu-item" 
             [matTooltip]="'admin.layout.jobDescription' | translate" matTooltipPosition="right">
            <mat-icon>work</mat-icon>
          </a>

          <!-- User Management Icon -->
          <a routerLink="/admin/user-management" routerLinkActive="active" class="collapsed-menu-item" 
             [matTooltip]="'admin.layout.userManagement' | translate" matTooltipPosition="right">
            <mat-icon>people</mat-icon>
          </a>
        </div>

        <!-- Back to Dashboard -->
        <!-- <div class="back-to-dashboard">
          <a routerLink="/dashboard" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            <span>View Dashboard</span>
          </a>
        </div> -->
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="admin-header">
          <div class="header-content">
            <h1>{{ pageTitle && pageTitle.indexOf('.') > -1 ? (pageTitle | translate) : pageTitle }}</h1>
            <p class="breadcrumb">{{ breadcrumb && breadcrumb.indexOf('.') > -1 ? (breadcrumb | translate) : breadcrumb }}</p>
          </div>
          
          <!-- Centered Search Bar -->
          <div class="header-search">
            <app-quick-search></app-quick-search>
          </div>
          
          <!-- Header Actions -->
          <div class="header-actions">
          <!-- User Menu -->
          <div class="user-menu" style="display:flex; align-items:center; gap:8px;">
            <!-- Language dropdown -->
            <div class="lang-dropdown" style="position:relative;" (click)="$event.stopPropagation()">
              <button mat-button class="lang-toggle" aria-haspopup="true" (click)="openLangMenu($event)" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 8px;">
                <img [src]="currentFlag()" alt="lang" style="width:22px;height:16px;object-fit:cover;border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,0.1)" />
                <span style="font-size:11px;font-weight:600;line-height:1">{{ translation.getCurrentLanguage() | uppercase }}</span>
              </button>
              <div *ngIf="langMenuOpen" class="lang-menu" style="position:absolute;right:0;top:36px;background:#fff;border:1px solid #e6e6e6;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);overflow:hidden;min-width:140px;z-index:200">
                <button class="lang-item" (click)="setLanguage('en')" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:transparent;border:none;width:100%;text-align:left"> 
                  <img src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/gb.svg" alt="EN" style="width:20px;height:14px;object-fit:cover" />
                  <span>English</span>
                </button>
                <button class="lang-item" (click)="setLanguage('fr')" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:transparent;border:none;width:100%;text-align:left"> 
                  <img src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/fr.svg" alt="FR" style="width:20px;height:14px;object-fit:cover" />
                  <span>Français</span>
                </button>
              </div>
            </div>

            
          
            
            
            
            
            
            
            <div style="width:8px"></div>

          
          
          
          
          
          
            
          
          
            
          
          
            
          
          
            
          
          
            
          
          
            
          
          
            
          
          
            
          
          
            
          
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
          
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
          
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
          
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
          
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
          
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
                <span>{{ 'shared.logout' | translate }}</span>
              </button>
            </mat-menu>
          </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content" [class.full-bleed]="fullBleed">
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
      transition: width 0.3s ease;
    }

    /* Collapsed Sidebar */
    .sidebar.collapsed {
      width: 70px;
      padding: 15px 10px;
    }

    /* Sidebar Toggle Section - positioned after logo, before user info */
    .sidebar-toggle-section {
      display: flex;
      justify-content: center;
      margin-bottom: 25px;
      padding: 10px 0;
    }

    .toggle-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .toggle-btn mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    /* Collapsed state styling for toggle button */
    .sidebar.collapsed .sidebar-toggle-section {
      margin-bottom: 20px;
      padding: 5px 0;
    }

    .sidebar.collapsed .toggle-btn {
      width: 45px;
      height: 45px;
    }

    /* Logo Container */
    .logo-container {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .logo-container img {
      max-width: 200px;
      height: auto;
      transition: all 0.3s ease;
    }

    .sidebar.collapsed .logo-container {
      margin-bottom: 20px;
      padding-bottom: 15px;
    }

    .sidebar.collapsed .logo-container img {
      max-width: 40px;
      margin-left: 5px;
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
      transition: all 0.3s ease;
    }

    .sidebar.collapsed .user-info {
      padding: 12px;
      justify-content: center;
      margin-bottom: 20px;
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

    /* Navigation Item Group (for expandable menus) */
    .nav-item-group {
      display: flex;
      flex-direction: column;
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
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(4px);
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: #f8fafc;
      border-left: 3px solid #ffffff;
      font-weight: 600;
    }

    .nav-item.expanded {
      background: rgba(255, 255, 255, 0.15);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .nav-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .nav-item span {
      flex: 1;
    }

    /* Expand/Collapse Icon */
    .expand-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      transition: transform 0.3s ease;
    }

    .nav-item.expanded .expand-icon {
      transform: rotate(180deg);
    }

    /* Sub-menu Styles */
    .sub-menu {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0 0 8px 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-top: none;
      overflow: hidden;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        max-height: 200px;
        transform: translateY(0);
      }
    }

    .sub-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px 10px 32px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 13px;
      font-weight: 400;
      transition: all 0.3s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .sub-nav-item:last-child {
      border-bottom: none;
    }

    .sub-nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      padding-left: 36px;
    }

    .sub-nav-item.active {
      background: rgba(255, 255, 255, 0.15);
      color: #f8fafc;
      font-weight: 500;
      border-left: 2px solid rgba(255, 255, 255, 0.8);
    }

    .sub-nav-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      opacity: 0.8;
    }

    .sub-nav-item span {
      flex: 1;
    }

    /* Collapsed Menu */
    .collapsed-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 10px;
      align-items: center;
    }

    .collapsed-menu-item {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: white;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    .collapsed-menu-item:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .collapsed-menu-item.active {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .collapsed-menu-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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
      transition: margin-left 0.3s ease;
    }

    /* Adjust main content when sidebar is collapsed */
    .admin-layout:has(.sidebar.collapsed) .main-content {
      margin-left: 70px;
    }

    /* Header */
    .admin-header {
      background: white;
      padding: 20px 30px;
      border-bottom: 1px solid #e0e0e0;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-content {
      justify-self: start;
    }
    
    .header-search {
      justify-self: center;
      display: flex;
      justify-content: center;
    }
    
    .header-actions {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 16px;
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

    /* Responsive Header */
    @media (max-width: 1024px) {
      .admin-header {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 15px;
        text-align: center;
      }
      
      .header-content,
      .header-search,
      .header-actions {
        justify-self: center;
      }
      
      .header-content {
        text-align: center;
      }
    }

    @media (max-width: 768px) {
      .admin-header {
        padding: 15px 20px;
        gap: 12px;
      }
      
      .header-content h1 {
        font-size: 20px;
      }
      
      .breadcrumb {
        font-size: 13px;
      }
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

    /* Utility to allow pages to use full-bleed layout like dashboard-builder */
    .page-content.full-bleed {
      padding: 0; /* remove default padding so child can take full width */
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .sidebar {
        width: 240px;
      }

      .sidebar.collapsed {
        width: 70px;
      }

      .main-content {
        margin-left: 240px;
      }

      .admin-layout:has(.sidebar.collapsed) .main-content {
        margin-left: 70px;
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
  @Input() fullBleed: boolean = false;
  currentUser: User | null = null;
  pageTitle: string = 'admin.layout.title';
  breadcrumb: string = 'Administration';
  langMenuOpen = false;

  // Sidebar collapse state
  isSidebarCollapsed: boolean = false;

  // Sub-menu expansion states
  isDashboardBuilderExpanded: boolean = false;
  isJobDescriptionExpanded: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    public translation: TranslationService,
    private notifier: NotificationService
  ) {}

  setLanguage(lang: string): void {
    this.translation.setLanguage(lang);
    const msg = this.translation.translate('shared.language_changed') || 'Language changed';
    const closeLabel = this.translation.translate('shared.close') || 'Close';
    this.snackBar.open(msg, closeLabel, { duration: 1500 });
    this.langMenuOpen = false;
  }

  @HostListener('document:click')
  closeLangMenu(): void {
    this.langMenuOpen = false;
  }

  openLangMenu(event: Event): void {
    event.stopPropagation();
    this.langMenuOpen = !this.langMenuOpen;
  }

  currentFlag(): string {
    const lang = this.translation.getCurrentLanguage?.() || this.translation.getCurrentLanguage();
    if (lang === 'fr') return 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/fr.svg';
    return 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/gb.svg';
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadSidebarState();
    // Set page title and breadcrumb based on current route
    this.updatePageInfo();

    // Register global logout handler so other modules (e.g., graphql error handler)
    // can trigger a client-side logout that clears in-memory state before redirect
    try {
      // Expose a small function on window to avoid circular imports
      (window as any).appLogout = () => {
        try {
          this.authService.logout();
        } catch (e) {
          console.warn('appLogout: failed to call authService.logout()', e);
        }
      };
    } catch (e) {
      console.warn('Failed to register global appLogout handler', e);
    }
  }

  updatePageInfo(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/admin/users')) {
      this.pageTitle = 'admin.layout.userManagement';
      this.breadcrumb = 'admin.layout.title';
    } else if (currentUrl.includes('/admin/widgets')) {
      this.pageTitle = 'admin.widgetSettings.title';
      this.breadcrumb = 'admin.layout.title';
    } else if (currentUrl.includes('/admin/sections')) {
      this.pageTitle = 'admin.sectionSettings.title';
      this.breadcrumb = 'admin.layout.title';
    }
  }

  // Sidebar collapse/expand methods
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.saveSidebarState();
  }

  private saveSidebarState(): void {
    localStorage.setItem('admin-sidebar-collapsed', this.isSidebarCollapsed.toString());
  }

  private loadSidebarState(): void {
    const savedState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedState !== null) {
      this.isSidebarCollapsed = savedState === 'true';
    }
    
    // Load sub-menu states
    const dashboardBuilderState = localStorage.getItem('admin-dashboard-builder-expanded');
    if (dashboardBuilderState !== null) {
      this.isDashboardBuilderExpanded = dashboardBuilderState === 'true';
    }
    
    const jobDescriptionState = localStorage.getItem('admin-job-description-expanded');
    if (jobDescriptionState !== null) {
      this.isJobDescriptionExpanded = jobDescriptionState === 'true';
    }
  }

  // Sub-menu toggle methods
  toggleDashboardBuilderMenu(): void {
    this.isDashboardBuilderExpanded = !this.isDashboardBuilderExpanded;
    localStorage.setItem('admin-dashboard-builder-expanded', this.isDashboardBuilderExpanded.toString());
  }

  toggleJobDescriptionMenu(): void {
    this.isJobDescriptionExpanded = !this.isJobDescriptionExpanded;
    localStorage.setItem('admin-job-description-expanded', this.isJobDescriptionExpanded.toString());
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.notifier.toastKey('notifications.logged_out', 'success', undefined, 3000).catch(()=>{});
    this.router.navigate(['/auth/login']);
  }
} 