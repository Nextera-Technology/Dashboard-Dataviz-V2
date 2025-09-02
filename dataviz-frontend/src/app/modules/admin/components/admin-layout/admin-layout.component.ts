import { Component, OnInit, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { NotificationService } from '../../../../../@dataviz/services/notification/notification.service';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
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
    MatSnackBarModule,
    TranslatePipe
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
            {{ 'admin.layout.title' | translate }}
          </div>
          <div class="nav-menu">
            <a routerLink="/admin/dashboard-list" routerLinkActive="active" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>{{ 'admin.dashboardList.header_title' | translate }}</span>
            </a>
            <a routerLink="/admin/user-management" routerLinkActive="active" class="nav-item">
              <mat-icon>people</mat-icon>
              <span>{{ 'admin.layout.userManagement' | translate }}</span>
            </a>
          </div>
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

    /* Utility to allow pages to use full-bleed layout like dashboard-builder */
    .page-content.full-bleed {
      padding: 0; /* remove default padding so child can take full width */
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
  @Input() fullBleed: boolean = false;
  currentUser: User | null = null;
  pageTitle: string = 'admin.layout.title';
  breadcrumb: string = 'admin.layout.title';
  langMenuOpen: boolean = false;

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

  async logout(): Promise<void> {
    this.authService.logout();
    await this.notifier.toastKey('notifications.logged_out', 'success', undefined, 3000).catch(()=>{});
    this.router.navigate(['/auth/login']);
  }
} 