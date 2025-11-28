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
import { Apollo } from 'apollo-angular';
import { QUICK_SEARCH_QUERY } from '../../../../../@dataviz/graphql/queries/quick-search/quick-search.query';
import { ShareDataService } from 'app/shared/services/share-data.service';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/auth/auth.service';
import { SessionMonitorService } from '../../../../core/auth/session-monitor.service';
import { QuickSearchComponent } from '../../../../shared/components/quick-search/quick-search.component';
import Swal from 'sweetalert2';

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
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed" [attr.aria-expanded]="!isSidebarCollapsed">
        <div class="logo-row">
          <div class="logo-container">
            <img 
              src="https://staging-alumni-dataviz.s3.ap-southeast-1.amazonaws.com/public/logo+with+text+right.png"
              alt="Nextera Logo"
            />
          </div>
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
            <!-- Dashboard Builder - Direct Link -->
            <a routerLink="/admin/dashboard-list" routerLinkActive="active" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>{{ 'admin.dashboardList.header_title' | translate }}</span>
            </a>

            <!-- Job Description - Direct Link -->
            <a routerLink="/admin/job-description" routerLinkActive="active" class="nav-item">
              <mat-icon>work</mat-icon>
              <span>{{ 'admin.layout.jobDescription' | translate }}</span>
            </a>

            <!-- User Management -->
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

        <div class="sidebar-footer">
          <button type="button" (click)="toggleSidebar()" class="toggle-btn" [attr.aria-label]="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'" [attr.aria-pressed]="isSidebarCollapsed">
            <mat-icon>{{ isSidebarCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content" [class.collapsed]="isSidebarCollapsed">
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
            <button
              *ngIf="showCreateButton()"
              mat-raised-button
              color="primary"
              (click)="onCreateDashboard()"
              class="create-dashboard-btn px-6 py-2 rounded-2xl text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <div class="flex items-center gap-2">
                <mat-icon>add</mat-icon>
                <span>{{ getCreateButtonText() | translate }}</span>
              </div>
            </button>
            <button mat-icon-button (click)="toggleTheme()" class="theme-toggle" [matTooltip]="currentTheme === 'theme-dark' ? 'Light mode' : 'Dark mode'">
              <mat-icon>{{ currentTheme === 'theme-dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
          <!-- User Menu -->
          <div class="user-menu" style="display:flex; align-items:center; gap:8px;">
            <!-- Language dropdown -->
            <div class="lang-dropdown" style="position:relative;" (click)="$event.stopPropagation()">
              <button mat-button class="lang-toggle" aria-haspopup="true" (click)="openLangMenu($event)" style="display:flex;align-items:center;padding:6px 8px;">
                <img [src]="currentFlag()" alt="lang" style="width:22px;height:16px;object-fit:cover;border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,0.1)" />
              </button>
              <div *ngIf="langMenuOpen" class="lang-menu" style="position:absolute;right:0;top:36px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);overflow:hidden;min-width:140px;z-index:8500">
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
      background: var(--bg-secondary);
    }

    /* Sidebar Styles */
    .sidebar {
      width: 220px;
      height: 100vh;
      background: var(--dv-rail-bg);
      color: var(--text-primary);
      padding: 14px;
      overflow-y: auto;
      box-shadow: 0 6px 24px rgba(17, 24, 39, 0.06);
      border-right: 1px solid var(--dv-rail-border);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease;
    }

    /* Collapsed Sidebar */
    .sidebar.collapsed {
      width: 64px;
      padding: 12px 8px;
    }

    .logo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 6px 12px;
      border-bottom: 1px solid var(--dv-rail-border);
      margin-bottom: 10px;
      position: sticky;
      top: 0;
      background: var(--dv-rail-bg);
      z-index: 1;
    }

    .toggle-btn { width: 36px; height: 36px; border-radius: 12px; border: 1.5px solid var(--dv-rail-border); background: linear-gradient(180deg, #ffffff, #f3f4f6); color: var(--text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(17,24,39,0.08); transition: all 0.2s ease; }

    .toggle-btn:hover { background: linear-gradient(180deg, #f7fafc, #eef2ff); border-color: rgba(59,130,246,0.35); color: #0f172a; box-shadow: 0 0 0 3px rgba(59,130,246,0.18), 0 6px 14px rgba(17,24,39,0.12); }

    .toggle-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.28); }

    .toggle-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Dark mode: make collapse button match ambient */
    :host-context(.theme-dark) .toggle-btn { background: var(--dv-item-bg) !important; color: #bfdbfe !important; border-color: var(--dv-rail-border) !important; box-shadow: 0 4px 12px rgba(2,6,23,0.35) !important; }
    :host-context(.theme-dark) .toggle-btn:hover { background: var(--dv-item-hover-bg) !important; color: #ffffff !important; border-color: rgba(59,130,246,0.35) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.18), 0 6px 14px rgba(2,6,23,0.45) !important; }
    :host-context(.theme-dark) .toggle-btn mat-icon { color: inherit !important; }

    /* Collapsed state styling for toggle button */
    .sidebar.collapsed .logo-row { padding: 6px 6px 10px; margin-bottom: 6px; }

    /* Logo Container */
    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .logo-container img {
      max-width: 110px;
      height: auto;
      transition: all 0.3s ease;
    }

    .sidebar.collapsed .logo-container img { max-width: 24px; margin-left: 2px; }

    /* User Info */
    .user-info { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 10px; background: var(--dv-item-bg); border-radius: 16px; border: 1px solid var(--dv-rail-border); transition: all 0.3s ease; color: var(--dv-text-muted); }

    .sidebar.collapsed .user-info { display: none; }

    .user-avatar { width: 36px; height: 36px; background: var(--dv-item-hover-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

    .user-avatar mat-icon { color: var(--dv-text-muted); font-size: 18px; width: 18px; height: 18px; }

    .user-details {
      flex: 1;
    }

    .user-name { font-size: 12px; font-weight: 600; margin: 0 0 2px 0; color: var(--text-primary); }

    .user-email { font-size: 11px; margin: 0 0 2px 0; color: var(--text-secondary); }

    .user-role { font-size: 10px; margin: 0; color: var(--text-secondary); text-transform: capitalize; }

    /* Admin Navigation */
    .admin-nav { flex: 1; margin-bottom: 16px; }

    .section-title { font-size: 12px; font-weight: 700; margin-bottom: 10px; color: var(--dv-text-muted); letter-spacing: .08em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }

    .section-icon {
      font-size: 18px;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Navigation Item Group (for expandable menus) */
    .nav-item-group {
      display: flex;
      flex-direction: column;
    }

    .nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--dv-item-bg); border-radius: 12px; color: var(--text-primary); text-decoration: none; font-size: 12.5px; font-weight: 600; transition: all 0.2s ease; border: 1px solid var(--dv-rail-border); cursor: pointer; }

    .nav-item:hover { background: var(--dv-item-hover-bg); }

    .nav-item.active { background: var(--dv-accent); color: #ffffff; border-color: transparent; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
    .nav-item.active mat-icon { color: #ffffff; }

    .nav-item.expanded {
      background: rgba(255, 255, 255, 0.15);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .nav-item mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--dv-accent); }

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
    .sub-menu { background: var(--dv-item-bg); border-radius: 0 0 12px 12px; border: 1px solid var(--dv-rail-border);
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

    .sub-nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px 8px 24px; color: #334155; text-decoration: none; font-size: 12px; font-weight: 500; transition: all 0.2s ease; border-bottom: 1px solid var(--dv-rail-border); }

    .sub-nav-item:last-child {
      border-bottom: none;
    }

    .sub-nav-item:hover { background: var(--dv-item-hover-bg); color: #0f172a; }

    .sub-nav-item.active { background: var(--dv-item-active-bg); color: #0f172a; }

    .sub-nav-item mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--dv-accent); }

    .sub-nav-item span {
      flex: 1;
    }

    /* Collapsed Menu */
    .collapsed-menu { display: flex; flex-direction: column; gap: 10px; padding-top: 8px; align-items: center; }

    .collapsed-menu-item { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--dv-item-bg); border-radius: 14px; color: #334155; text-decoration: none; cursor: pointer; transition: all 0.2s ease; border: 1px solid var(--dv-rail-border); }

    .collapsed-menu-item:hover { background: var(--dv-item-hover-bg); }

    .collapsed-menu-item.active { background: var(--dv-accent); border-color: transparent; color: #fff; }
    .collapsed-menu-item.active mat-icon { color: #fff; }

    .collapsed-menu-item mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--dv-accent); }

    .sidebar-footer { margin-top: auto; padding-top: 8px; border-top: 1px solid var(--dv-rail-border); display: flex; justify-content: center; }

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
    .main-content { flex: 1; margin-left: 220px; display: flex; flex-direction: column; transition: margin-left 0.3s ease; }

    .main-content.collapsed {
      margin-left: 64px;
    }

    /* Header */
    .admin-header {
      background: var(--bg-primary);
      padding: 20px 30px;
      border-bottom: 1px solid var(--border-color);
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
    .theme-toggle { color: var(--text-secondary); }
    .theme-toggle:hover { color: var(--text-primary); }

    .create-dashboard-btn { border: none; outline: none; cursor: pointer; background-color: var(--dv-accent) !important; color: white !important; }
    .create-dashboard-btn mat-icon { font-size: 20px; width: 20px; height: 20px; color: white !important; }
    .create-dashboard-btn span { color: white !important; }
    .create-dashboard-btn:hover { background-color: var(--primary-dark) !important; box-shadow: 0 8px 20px rgba(59,130,246,0.4) !important; }
    .create-dashboard-btn:active { transform: scale(0.98) !important; }

    .header-content h1 {
      margin: 0 0 5px 0;
      color: var(--text-primary);
      font-size: 24px;
      font-weight: 600;
    }

    .breadcrumb {
      margin: 0;
      color: var(--text-secondary);
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
      color: var(--text-primary);
    }

    .menu-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .menu-name {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: var(--text-primary);
    }

    .menu-email {
      margin: 0 0 4px 0;
      color: var(--text-secondary);
      font-size: 12px;
    }

    .menu-role {
      margin: 0;
      color: var(--text-secondary);
      font-size: 11px;
      text-transform: capitalize;
    }

    .lang-menu { background: var(--bg-primary); border: 1px solid var(--border-color); }
    .lang-item span { color: var(--text-primary); }

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
    @media (max-width: 1024px) { .sidebar { width: 200px; } .main-content { margin-left: 200px; } .main-content.collapsed { margin-left: 64px; } }

    @media (max-width: 640px) { .sidebar { width: 172px; } .main-content { margin-left: 172px; } .main-content.collapsed { margin-left: 64px; } .nav-item { font-size: 12px; padding: 8px 10px; } }
  `]
})
export class AdminLayoutComponent implements OnInit {
  @Input() fullBleed: boolean = false;
  currentUser: User | null = null;
  pageTitle: string = 'admin.layout.title';
  breadcrumb: string = 'Administration';
  langMenuOpen = false;
  currentTheme: string = (localStorage.getItem('dv-theme') || 'theme-navy');

  // Sidebar collapse state
  isSidebarCollapsed: boolean = false;

  // Removed sub-menu expansion states - using direct navigation now

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    public translation: TranslationService,
    private notifier: NotificationService,
    private apollo: Apollo,
    private shareDataService: ShareDataService,
    private sessionMonitor: SessionMonitorService // Initialize session monitoring early
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
    this.applyTheme(this.currentTheme);

    try {
      const shown = sessionStorage.getItem('dv-welcome-modal-session-shown');
      if (!shown) {
        this.openWelcomeModal();
      }
    } catch {}
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
    
    // Removed sub-menu state loading - using direct navigation now
  }

  // Removed sub-menu toggle methods - using direct navigation now

  async logout(): Promise<void> {
    this.authService.logout();
    await this.notifier.toastKey('notifications.logged_out', 'success', undefined, 3000).catch(()=>{});
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if create button should be shown based on current route
   */
  showCreateButton(): boolean {
    const url = this.router.url;
    return url.includes('/admin/dashboard-list') || 
           url.includes('/admin/dashboard-table') ||
           url.includes('/admin/job-description') ||
           url.includes('/admin/job-description-table');
  }

  /**
   * Get the appropriate create button text based on current route
   */
  getCreateButtonText(): string {
    const url = this.router.url;
    if (url.includes('/admin/job-description')) {
      return 'admin.dashboardList.create_button';
    }
    return 'admin.dashboardList.create_button';
  }

  /**
   * Handle create dashboard button click
   * Emit event to child component via window event
   */
  onCreateDashboard(): void {
    // Dispatch custom event that child component can listen to
    window.dispatchEvent(new CustomEvent('admin-create-dashboard'));
  }
  applyTheme(theme: string): void {
    const themes = ['theme-default','theme-brand','theme-teal','theme-dark','theme-navy'];
    themes.forEach(t => document.body.classList.remove(t));
    document.body.classList.add(theme);
    localStorage.setItem('dv-theme', theme);
    this.currentTheme = theme;
  }

  toggleTheme(): void {
    this.applyTheme(this.currentTheme === 'theme-dark' ? 'theme-navy' : 'theme-dark');
  }

  private openWelcomeModal(): void {
    const lastId = localStorage.getItem('dashboardId');
    const t = (key: string, fallback: string): string => this.translation.translate(key) || fallback;

    const title = t('admin.welcomeModal.title', 'What do you want to do today?');
    const subtitle = t('admin.welcomeModal.subtitle', "Tell us what you're looking for or choose from quick actions");
    const searchPlaceholder = t('admin.welcomeModal.search_placeholder', 'Search users, dashboards...');
    const searchHint = t('admin.welcomeModal.search_hint', 'Type to search. Results will appear here.');
    const quickActionsLabel = t('admin.welcomeModal.quick_actions_label', 'Quick actions');
    const actionCreateEsTitle = t('admin.welcomeModal.action_create_es_title', 'Create employability survey dashboard');
    const actionCreateJdTitle = t('admin.welcomeModal.action_create_jd_title', 'Create job description dashboard');
    const actionNewDashboardSub = t('admin.welcomeModal.action_new_dashboard_sub', 'New dashboard');
    const actionViewEsTitle = t('admin.welcomeModal.action_view_es_title', 'Enter view dashboard employability survey (last)');
    const actionViewJdTitle = t('admin.welcomeModal.action_view_jd_title', 'Enter view dashboard job description (last)');
    const actionViewLastSub = t('admin.welcomeModal.action_view_last_sub', 'Uses last dashboard');
    const footerHint = t('admin.welcomeModal.footer_hint', 'You can close this and continue; it appears only on first entry.');

    const noResultsText = t('admin.welcomeModal.no_results', 'No results found.');
    const resultSubJob = t('admin.welcomeModal.result_sub_job', 'job description');
    const resultSubEs = t('admin.welcomeModal.result_sub_es', 'employability survey');
    const resultSubUser = t('admin.welcomeModal.result_sub_user', 'user');

    const html = `
      <div class="welcome-modal" style="text-align:left;">
        <div class="wm-header" style="padding:16px 18px;border-bottom:1px solid var(--dv-rail-border);background:linear-gradient(135deg,var(--dv-item-bg),var(--dv-item-hover-bg));border-top-left-radius:16px;border-top-right-radius:16px;">
          <div style="font-size:20px;font-weight:800;">${title}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${subtitle}</div>
        </div>

        <div class="wm-body" style="padding:16px 18px;">
          <div id="welcome-search" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--dv-rail-border);border-radius:14px;background:var(--dv-item-bg);box-shadow:0 6px 16px rgba(17,24,39,0.08);">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--dv-item-hover-bg);color:var(--text-secondary);font-size:14px;">🔎</span>
            <input id="wm-search-input" type="text" placeholder="${searchPlaceholder}" style="flex:1;border:none;background:transparent;color:var(--text-primary);outline:none;font-size:13px;" />
          </div>

          <div id="wm-results" style="margin-top:12px;">
            <div style="font-size:12px;color:var(--text-secondary);">${searchHint}</div>
          </div>

          <div style="margin-top:16px;font-size:12px;color:var(--text-secondary);">${quickActionsLabel}</div>
          <div class="wm-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
            <button id="action-create-es" class="wm-action">
              <span class="wm-action-icon">📊</span>
              <div class="wm-action-text">
                <div class="wm-action-title">${actionCreateEsTitle}</div>
                <div class="wm-action-sub">${actionNewDashboardSub}</div>
              </div>
            </button>
            <button id="action-create-jd" class="wm-action">
              <span class="wm-action-icon">🗂️</span>
              <div class="wm-action-text">
                <div class="wm-action-title">${actionCreateJdTitle}</div>
                <div class="wm-action-sub">${actionNewDashboardSub}</div>
              </div>
            </button>
            <button id="action-view-es" class="wm-action">
              <span class="wm-action-icon">📄</span>
              <div class="wm-action-text">
                <div class="wm-action-title">${actionViewEsTitle}</div>
                <div class="wm-action-sub">${actionViewLastSub}</div>
              </div>
            </button>
            <button id="action-view-jd" class="wm-action">
              <span class="wm-action-icon">📄</span>
              <div class="wm-action-text">
                <div class="wm-action-title">${actionViewJdTitle}</div>
                <div class="wm-action-sub">${actionViewLastSub}</div>
              </div>
            </button>
          </div>
          <div style="margin-top:14px;font-size:11px;color:var(--text-secondary);">${footerHint}</div>
        </div>
      </div>
      <style>
        .wm-action { display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--dv-rail-border);border-radius:14px;background:var(--dv-item-bg);cursor:pointer;transition:transform .15s ease, box-shadow .15s ease; }
        .wm-action:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(17,24,39,0.10); }
        .wm-action-icon { font-size:18px; }
        .wm-action-title { font-size:13px;font-weight:600;color:var(--text-primary); }
        .wm-action-sub { font-size:11px;color:var(--text-secondary); }
        .wm-result-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid var(--dv-rail-border); border-radius:12px; background:var(--dv-item-bg); cursor:pointer; }
        .wm-result-item + .wm-result-item { margin-top:8px; }
        .wm-result-icon { width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:6px; background:var(--dv-item-hover-bg); font-size:14px; }
        .wm-result-title { font-size:13px; font-weight:600; color:var(--text-primary); }
        .wm-result-sub { font-size:11px; color:var(--text-secondary); }
        .wm-chip { font-size:10px; padding:2px 6px; border-radius:8px; background:var(--dv-item-hover-bg); color:var(--text-secondary); margin-left:auto; }
      </style>
    `;

    Swal.fire({
      html,
      width: 720,
      padding: '0',
      showConfirmButton: false,
      showCloseButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      background: 'var(--dv-item-bg)',
      backdrop: this.currentTheme === 'theme-dark' ? 'rgba(2,6,23,0.72)' : 'rgba(17,24,39,0.28)',
      customClass: {
        container: 'dv-welcome-container',
        popup: 'dv-welcome-popup'
      },
      didOpen: () => {
        sessionStorage.setItem('dv-welcome-modal-session-shown', 'true');
        const container = Swal.getHtmlContainer();
        if (!container) return;

        const goDashboard = (id: string | null) => {
          if (id) {
            try { localStorage.setItem('dashboardId', id); } catch {}
            this.shareDataService.setDashboardId(id);
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/admin/dashboard-list']);
          }
          Swal.close();
        };
        
        const resultsEl = container.querySelector('#wm-results') as HTMLElement | null;
        const searchInput = container.querySelector('#wm-search-input') as HTMLInputElement | null;
        let debounceTimer: any = null;
        const renderResults = (items: any[]) => {
          if (!resultsEl) return;
          if (!items || items.length === 0) {
            resultsEl.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);">${noResultsText}</div>`;
            return;
          }
          resultsEl.innerHTML = items.map((item: any) => {
            const cat = (item.category || '').toLowerCase();
            const icon = cat.includes('job') ? '🗂️' : (cat.includes('es') ? '📊' : (cat.includes('user') ? '👤' : '🔎'));
            const subtitle = cat.includes('job')
              ? `${resultSubJob}`
              : (cat.includes('es')
                  ? `${resultSubEs}`
                  : (cat.includes('user')
                      ? `${resultSubUser}`
                      : (item.subtitle || '')));
            return `
              <div class="wm-result-item" data-id="${item.id || ''}" data-cat="${item.category || ''}">
                <span class="wm-result-icon">${icon}</span>
                <div>
                  <div class="wm-result-title">${item.title || item.name || 'Untitled'}</div>
                  <div class="wm-result-sub">${subtitle}</div>
                </div>
                <span class="wm-chip">${item.category || ''}</span>
              </div>
            `;
          }).join('');

          // Bind clicks
          resultsEl.querySelectorAll('.wm-result-item').forEach(el => {
            el.addEventListener('click', () => {
              const id = (el as HTMLElement).getAttribute('data-id');
              const cat = ((el as HTMLElement).getAttribute('data-cat') || '').toUpperCase();
              if (cat.includes('USER')) {
                this.router.navigate(['/admin/user-management']);
                Swal.close();
                return;
              }
              if (id) {
                this.shareDataService.setDashboardId(id);
                this.router.navigate(['/dashboard']);
                Swal.close();
              }
            });
          });
        };

        const performSearch = async (query: string) => {
          if (!query || query.length < 2) { renderResults([]); return; }
          try {
            const result = await this.apollo.query<any>({
              query: QUICK_SEARCH_QUERY,
              variables: { input: { query, categories: null, limit: 8, page: 1 } },
              fetchPolicy: 'network-only'
            }).toPromise();
            const flat = (result?.data?.quickSearch?.results || []).flatMap((cat: any) =>
              (cat.items || []).map((it: any) => ({ ...it, category: cat.category }))
            );
            renderResults(flat);
          } catch (e) {
            renderResults([]);
          }
        };

        searchInput?.addEventListener('input', (e: any) => {
          const q = (e.target?.value || '').toString();
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => performSearch(q), 300);
        });

        container.querySelector('#action-create-es')?.addEventListener('click', () => { this.router.navigate(['/admin/dashboard-create']); Swal.close(); });
        container.querySelector('#action-create-jd')?.addEventListener('click', () => { this.router.navigate(['/admin/job-description-create']); Swal.close(); });
        container.querySelector('#action-view-es')?.addEventListener('click', () => goDashboard(lastId));
        container.querySelector('#action-view-jd')?.addEventListener('click', () => goDashboard(lastId));
      }
    });
  }
}
