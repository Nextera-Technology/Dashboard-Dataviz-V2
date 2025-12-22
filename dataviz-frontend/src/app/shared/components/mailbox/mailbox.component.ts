import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationRepository } from '@dataviz/repositories/notification/notification.repository';
import { Subscription } from 'rxjs';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-mailbox',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    DatePipe
  ],
  template: `
    <div class="mailbox-overlay" *ngIf="isOpen" (click)="toggleMailbox()"></div>
    <div class="mailbox-container" [class.open]="isOpen">
      <div class="mailbox-header">
        <div class="header-title">
            <h3>{{ 'shared.mailbox.title' | translate }}</h3>
            <span class="badge" *ngIf="totalData > 0">{{ totalData }}</span>
        </div>
        <button mat-icon-button (click)="toggleMailbox()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="mailbox-content" #scrollContainer (scroll)="onScroll($event)">
        <div *ngIf="loading && notifications.length === 0" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && notifications.length === 0" class="no-notifications">
          <mat-icon>notifications_off</mat-icon>
          <p>{{ 'shared.mailbox.no_notifications' | translate }}</p>
        </div>

        <div class="notification-list">
          <div *ngFor="let notification of notifications" class="notification-item" [class.unread]="!notification.isRead">
            <div class="notification-icon">
              <mat-icon *ngIf="isPdfExport(notification)">picture_as_pdf</mat-icon>
              <mat-icon *ngIf="!isPdfExport(notification)">notifications</mat-icon>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.reference }}</div>
              <div class="notification-text">{{ notification.content }}</div>
              
              <!-- Attachments -->
              <div *ngIf="notification.attachments?.length" class="attachments-list">
                <div *ngFor="let attachment of notification.attachments; let i = index" class="attachment-item">
                   <a [href]="getCleanUrl(attachment)" target="_blank" class="attachment-link">
                     <mat-icon>download</mat-icon>
                     <span>Download PDF {{ i + 1 }}</span>
                   </a>
                </div>
              </div>

              <div class="notification-date">{{ notification.sendDate | date:'medium' }}</div>
            </div>
          </div>
        </div>
        
        <div *ngIf="loading && notifications.length > 0" class="loading-more">
           <mat-spinner diameter="24"></mat-spinner>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mailbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1099;
    }
    .mailbox-container {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: var(--fuse-bg-card, #ffffff);
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
      z-index: 1100;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
      color: var(--fuse-text-default, #1e293b);
    }
    
    .mailbox-container.open {
      right: 0;
    }

    .mailbox-header {
      padding: 16px;
      border-bottom: 1px solid var(--fuse-border, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--fuse-bg-default, #f8fafc);
    }

    .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .badge {
        background: var(--fuse-primary, #3b82f6);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .mailbox-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .mailbox-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    .notification-item {
      padding: 16px;
      border-bottom: 1px solid var(--fuse-border, #e2e8f0);
      display: flex;
      gap: 12px;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: var(--fuse-bg-hover, #f1f5f9);
    }

    .notification-item.unread {
      background: var(--fuse-bg-primary-50, #eff6ff);
    }

    .notification-icon {
      color: var(--fuse-primary, #3b82f6);
    }

    .notification-body {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .notification-text {
      font-size: 13px;
      color: var(--fuse-text-secondary, #64748b);
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .attachments-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .attachment-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      background: var(--fuse-bg-card, #ffffff);
      border: 1px solid var(--fuse-border, #e2e8f0);
      border-radius: 6px;
      text-decoration: none;
      color: var(--fuse-primary, #3b82f6);
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .attachment-link:hover {
      background: var(--fuse-bg-hover, #f1f5f9);
      border-color: var(--fuse-primary, #3b82f6);
    }

    .attachment-link mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .notification-date {
      font-size: 11px;
      color: var(--fuse-text-secondary, #94a3b8);
    }

    .loading-spinner, .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--fuse-text-secondary, #64748b);
      gap: 12px;
    }

    .loading-more {
        display: flex;
        justify-content: center;
        padding: 10px;
    }
  `]
})
export class MailboxComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  
  isOpen = false;
  notifications: any[] = [];
  loading = false;
  totalData = 0;
  
  pagination = {
    limit: 10,
    page: 0
  };

  private _notificationRepository = inject(NotificationRepository);
  private _cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit() {
    this.loadNotifications();
  }

  toggleMailbox() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.resetAndLoad();
    }
    this._cdr.markForCheck();
  }

  async loadNotifications(append = false) {
    if (this.loading) return;
    
    this.loading = true;
    this._cdr.markForCheck();

    try {
      const result = await this._notificationRepository.getAllNotification(
        this.pagination,
        {}, // filter
        { field: 'CREATED_AT', ascending: false } // sort
      );

      if (append) {
        this.notifications = [...this.notifications, ...result.data];
      } else {
        this.notifications = result.data;
      }
      
      this.totalData = result.totalData;
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }

  resetAndLoad() {
    this.pagination.page = 0;
    this.notifications = [];
    this.loadNotifications();
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      if (this.notifications.length < this.totalData && !this.loading) {
        this.pagination.page++;
        this.loadNotifications(true);
      }
    }
  }

  isPdfExport(notification: any): boolean {
    return notification.reference?.includes('PDF Export') || notification.content?.includes('PDF');
  }

  getCleanUrl(url: string): string {
    return url; // The URL from S3 should be already signed or public
  }
}
