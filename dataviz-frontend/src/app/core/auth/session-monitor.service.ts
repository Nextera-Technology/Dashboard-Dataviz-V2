import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
import { TranslationService } from 'app/shared/services/translation/translation.service';

export interface SessionStatus {
  isValid: boolean;
  remainingMs: number;
  expiresAt: number | null;
  warned: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SessionMonitorService implements OnDestroy {
  
  // Session timing constants
  private readonly CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
  private readonly WARNING_THRESHOLD_MS = 5 * 60 * 1000; // Warn 5 minutes before expiry
  private readonly PDF_EXPORT_MIN_SESSION_MS = 12 * 60 * 1000; // Require 12 min for PDF export
  
  private destroy$ = new Subject<void>();
  private checkSubscription: Subscription | null = null;
  private expiresAt: number | null = null;
  private hasWarnedUser = false;
  private hasTriggeredExpiry = false;
  
  private sessionStatus$ = new BehaviorSubject<SessionStatus>({
    isValid: true,
    remainingMs: Infinity,
    expiresAt: null,
    warned: false
  });
  
  constructor(private translationService: TranslationService) {
    this.initializeFromToken();
    this.checkSession();
    this.startMonitoring();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopMonitoring();
  }
  
  /**
   * Initialize session expiry from stored JWT token
   */
  initializeFromToken(): void {
    try {
      const tokenKey = environment?.tokenKey || 'token';
      let token = localStorage.getItem(tokenKey);
      
      if (!token) {
        this.expiresAt = null;
        this.updateStatus();
        return;
      }
      
      // Remove quotes if stored as JSON string
      token = token.replace(/^["'](.+(?=["']$))["']$/, '$1');
      
      // Parse JWT to get expiry
      const payload = this.parseJwtPayload(token);
      if (payload?.exp) {
        this.expiresAt = payload.exp * 1000;
        this.hasWarnedUser = false;
        this.hasTriggeredExpiry = false;
        this.updateStatus();
      }
    } catch (error) {
      console.warn('SessionMonitor: Failed to parse token expiry', error);
      this.expiresAt = null;
      this.updateStatus();
    }
  }
  
  /**
   * Parse JWT payload without verification
   */
  private parseJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
  
  /**
   * Start periodic session monitoring
   */
  startMonitoring(): void {
    if (this.checkSubscription) return;
    
    this.checkSubscription = interval(this.CHECK_INTERVAL_MS)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkSession();
      });
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkSubscription) {
      this.checkSubscription.unsubscribe();
      this.checkSubscription = null;
    }
  }
  
  /**
   * Check current session status
   */
  private checkSession(): void {
    this.updateStatus();
    
    const status = this.sessionStatus$.value;
    
    if (!status.isValid && !this.hasTriggeredExpiry) {
      this.hasTriggeredExpiry = true;
      this.triggerSessionExpired();
      return;
    }
    
    if (status.remainingMs <= this.WARNING_THRESHOLD_MS && !this.hasWarnedUser && status.isValid) {
      this.hasWarnedUser = true;
      this.warnSessionExpiringSoon(status.remainingMs);
    }
  }
  
  /**
   * Update session status
   */
  private updateStatus(): void {
    const now = Date.now();
    const remainingMs = this.expiresAt ? this.expiresAt - now : Infinity;
    const isValid = !this.expiresAt || remainingMs > 0;
    
    this.sessionStatus$.next({
      isValid,
      remainingMs: Math.max(0, remainingMs),
      expiresAt: this.expiresAt,
      warned: this.hasWarnedUser
    });
  }
  
  /**
   * Get remaining session time in milliseconds
   */
  getRemainingMs(): number {
    if (!this.expiresAt) return Infinity;
    return Math.max(0, this.expiresAt - Date.now());
  }
  
  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    return this.getRemainingMs() > 0;
  }
  
  /**
   * Check if session has enough time for long operations
   */
  hasEnoughTimeForExport(): boolean {
    return this.getRemainingMs() >= this.PDF_EXPORT_MIN_SESSION_MS;
  }
  
  /**
   * Get session status observable
   */
  getSessionStatus$() {
    return this.sessionStatus$.asObservable();
  }
  
  /**
   * Format remaining time for display
   */
  formatRemainingTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
  
  /**
   * Show warning that session is expiring soon
   */
  private warnSessionExpiringSoon(remainingMs: number): void {
    const timeStr = this.formatRemainingTime(remainingMs);
    const title = this.translationService.translate('session.global_expiring_title');
    const messageTemplate = this.translationService.translate('session.global_expiring_message');
    const text = messageTemplate.replace('{{time}}', timeStr);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title,
      text,
      showConfirmButton: false,
      timer: 8000,
      timerProgressBar: true
    });
  }
  
  /**
   * Trigger session expired flow
   */
  private triggerSessionExpired(): void {
    try {
      const win = window as any;
      if (win && typeof win.appLogout === 'function') {
        win.appLogout();
      }
    } catch {}
    
    try {
      const tokenKey = environment?.tokenKey || 'token';
      localStorage.removeItem(tokenKey);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('dashboardId');
      if (environment?.userProfileKey) {
        localStorage.removeItem(environment.userProfileKey);
      }
      sessionStorage.clear();
    } catch {}
    
    const title = this.translationService.translate('session.global_expired_title');
    const text = this.translationService.translate('session.global_expired_message');

    Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      window.location.replace('/auth/login');
    });
  }
  
  /**
   * Reset warning state (call after user re-authenticates)
   */
  resetWarningState(): void {
    this.hasWarnedUser = false;
    this.hasTriggeredExpiry = false;
    this.initializeFromToken();
  }
  
  /**
   * Check session before starting export
   */
  checkBeforeExport(): { canProceed: boolean; remainingMs: number; message?: string } {
    const remainingMs = this.getRemainingMs();
    
    if (remainingMs <= 0) {
      return {
        canProceed: false,
        remainingMs: 0,
        message: 'session_expired'
      };
    }
    
    if (remainingMs < this.PDF_EXPORT_MIN_SESSION_MS) {
      return {
        canProceed: false,
        remainingMs,
        message: 'session_insufficient'
      };
    }
    
    return {
      canProceed: true,
      remainingMs
    };
  }
}
