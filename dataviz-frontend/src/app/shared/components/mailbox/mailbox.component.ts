import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MailboxService } from 'app/shared/services/mailbox.service';
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
            <span class="badge" *ngIf="(unreadCount$ | async)! > 0">{{ unreadCount$ | async }}</span>
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
              <div *ngIf="notification.attachments?.length" class="attachments-section">
                <button class="attachments-toggle" (click)="toggleAttachments(notification, $event)">
                  <mat-icon class="toggle-icon">{{ isAttachmentsExpanded(notification) ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</mat-icon>
                  <span>{{ notification.attachments.length }} {{ 'shared.mailbox.attachments' | translate }}</span>
                </button>

                <div *ngIf="isAttachmentsExpanded(notification)" class="attachments-list">
                  <div *ngFor="let attachment of notification.attachments" class="attachment-item">
                     <a [href]="getCleanUrl(attachment)" target="_blank" class="attachment-link">
                       <mat-icon>picture_as_pdf</mat-icon>
                       <span class="attachment-name" [matTooltip]="getAttachmentName(attachment)">{{ getAttachmentName(attachment) }}</span>
                       <mat-icon class="download-icon">download</mat-icon>
                     </a>
                  </div>
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

    .attachments-section {
      margin-top: 8px;
      margin-bottom: 8px;
    }

    .attachments-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      padding: 4px 0;
      cursor: pointer;
      color: var(--fuse-primary, #3b82f6);
      font-size: 12px;
      font-weight: 500;
      font-family: inherit;
    }

    .attachments-toggle:hover {
      text-decoration: underline;
    }

    .attachments-toggle .toggle-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .attachment-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--fuse-bg-card, #ffffff);
      border: 1px solid var(--fuse-border, #e2e8f0);
      border-radius: 8px;
      text-decoration: none;
      color: var(--fuse-text-default, #1e293b);
      font-size: 13px;
      transition: all 0.2s;
    }
    
    .attachment-link:hover {
      background: var(--fuse-bg-hover, #f1f5f9);
      border-color: var(--fuse-primary, #3b82f6);
      color: var(--fuse-primary, #3b82f6);
      transform: translateX(2px);
    }

    .attachment-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--fuse-text-secondary, #94a3b8);
    }
    
    .attachment-link:hover mat-icon {
      color: var(--fuse-primary, #3b82f6);
    }

    .attachment-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    
    .download-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      opacity: 0.7;
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
  expandedAttachmentIds = new Set<string>();
  
  pagination = {
    limit: 10,
    page: 0
  };

  private _mailboxService = inject(MailboxService);
  private _cdr = inject(ChangeDetectorRef);
  
  public unreadCount$ = this._mailboxService.unreadCount$;

  constructor() {}

  ngOnInit() {
    // Initial load
    this.loadNotifications();
    
    // Subscribe to notifications updates
    this._mailboxService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this._cdr.markForCheck();
    });

    this._mailboxService.loading$.subscribe(loading => {
      this.loading = loading;
      this._cdr.markForCheck();
    });

    this._mailboxService.totalData$.subscribe(total => {
      this.totalData = total;
      this._cdr.markForCheck();
    });
  }

  toggleMailbox() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.resetAndLoad();
    }
    this._cdr.markForCheck();
  }

  loadNotifications(append = false) {
    this._mailboxService.loadNotifications(this.pagination, append);
  }

  resetAndLoad() {
    this.pagination.page = 0;
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

  toggleAttachments(notification: any, event: Event): void {
    event.stopPropagation();
    if (this.expandedAttachmentIds.has(notification._id)) {
      this.expandedAttachmentIds.delete(notification._id);
    } else {
      this.expandedAttachmentIds.add(notification._id);
      // Mark as read when expanded
      this._mailboxService.markAsRead(notification);
    }
  }

  isAttachmentsExpanded(notification: any): boolean {
    return this.expandedAttachmentIds.has(notification._id);
  }

  getAttachmentName(url: string): string {
    try {
      // Extract filename from URL (remove query params)
      const path = url.split('?')[0];
      const filenameWithExt = path.split('/').pop() || '';
      const filename = decodeURIComponent(filenameWithExt).replace(/\.pdf$/i, '');
      
      // Format: ES/JD_certificationTitle_class[_school]-autogenerated-id
      // We want to cut from the first '-' to remove the autogenerated ID
      const firstHyphenIndex = filename.indexOf('-');
      if (firstHyphenIndex > 0) {
        // Return the part before the first hyphen
        // Also replace underscores with spaces for better readability
        return filename.substring(0, firstHyphenIndex).replace(/_/g, ' ');
      }
      
      return filename.replace(/_/g, ' ');
    } catch (e) {
      return 'Attachment';
    }
  }
}
