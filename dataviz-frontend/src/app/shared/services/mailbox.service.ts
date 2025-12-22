import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { NotificationRepository } from '@dataviz/repositories/notification/notification.repository';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MailboxService {
  private _notificationRepository = inject(NotificationRepository);
  private _authService = inject(AuthService);

  private _notifications = new BehaviorSubject<any[]>([]);
  public notifications$ = this._notifications.asObservable();

  private _unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this._unreadCount.asObservable();

  private _loading = new BehaviorSubject<boolean>(false);
  public loading$ = this._loading.asObservable();

  private _totalData = new BehaviorSubject<number>(0);
  public totalData$ = this._totalData.asObservable();

  constructor() {}

  async loadNotifications(pagination: any, append = false) {
    if (this._loading.value) return;
    
    this._loading.next(true);

    try {
      const result = await this._notificationRepository.getAllNotification(
        pagination,
        {}, // filter
        { field: 'CREATED_AT', ascending: false } // sort
      );

      let currentNotifications = append ? this._notifications.value : [];
      const newNotifications = append ? [...currentNotifications, ...result.data] : result.data;
      
      this._notifications.next(newNotifications);
      this._totalData.next(result.totalData);
      
      this.calculateUnreadCount(newNotifications);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      this._loading.next(false);
    }
  }

  calculateUnreadCount(notifications: any[]) {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser) return;

    // Note: This only counts unread in the *loaded* notifications. 
    // Ideally, the backend should return the total unread count.
    // Assuming we want to count based on what we have or if the user wants real-time for all, 
    // we might need a separate query for count. For now, we count visible ones.
    // However, the user request implies a global counter. 
    // If the pagination limit is small, this count might be inaccurate.
    // But without a "getUnreadCount" endpoint, we can only count what we have or fetch all (expensive).
    // Let's assume for now we count from the loaded list, or maybe the user expects the count to be from the fetched data.
    // Actually, usually the "Mailbox" badge shows total unread. 
    // If the API `getAllNotification` doesn't return unread count, we might be limited.
    // But let's proceed with counting from the list we fetch. 
    // To make it better, maybe we should fetch a larger batch or checking if the backend provides it.
    // Looking at the notification query, it only returns `totalData` and `data`.
    
    let count = 0;
    notifications.forEach(n => {
      const recipient = n.recipients.find((r: any) => 
        r.userId?._id === currentUser.id || r.userId === currentUser.id || r.email === currentUser.email
      );
      if (recipient && !recipient.isRead) {
        count++;
      }
    });
    this._unreadCount.next(count);
  }

  async markAsRead(notification: any) {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser) return;

    const recipient = notification.recipients.find((r: any) => 
      r.userId?._id === currentUser.id || r.userId === currentUser.id || r.email === currentUser.email
    );

    if (recipient && !recipient.isRead) {
      // Optimistic update
      recipient.isRead = true;
      recipient.readAt = new Date().toISOString();
      
      // Update count
      const currentCount = this._unreadCount.value;
      this._unreadCount.next(Math.max(0, currentCount - 1));

      // Call API
      try {
        await this._notificationRepository.updateNotification(notification._id, {
          recipients: [{
            userId: recipient.userId?._id || recipient.userId,
            email: recipient.email,
            isRead: true,
            readAt: recipient.readAt
          }]
        });
      } catch (error) {
        console.error('Failed to mark as read', error);
        // Revert on error? For now, let's keep it simple.
        recipient.isRead = false;
        this._unreadCount.next(currentCount);
      }
    }
  }
}
