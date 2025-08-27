import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import { TranslationService } from 'app/shared/services/translation/translation.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private translation: TranslationService) {}

  private interpolate(template: string | null | undefined, params?: Record<string, string>): string | undefined {
    if (!template) return template;
    if (!params) return template;
    let out = template;
    for (const k of Object.keys(params)) {
      out = out.split(`{${k}}`).join(params[k]);
    }
    return out;
  }

  async success(title: string, text?: string, timer = 2000): Promise<SweetAlertResult<any>> {
    return Swal.fire({ icon: 'success', title, text, timer, timerProgressBar: true });
  }

  /**
   * Show success using translation keys namespace, e.g. notifications.mykey
   * It will lookup `${key}.title` and `${key}.message` and interpolate params.
   */
  async successKey(key: string, params?: Record<string,string>, timer = 2000): Promise<SweetAlertResult<any>> {
    const title = this.translation.translate(`${key}.title`);
    const messageTemplate = this.translation.translate(`${key}.message`);
    const message = this.interpolate(messageTemplate, params);
    return this.success(title, message, timer);
  }

  async error(title: string, text?: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({ icon: 'error', title, text });
  }

  async errorKey(key: string, params?: Record<string,string>): Promise<SweetAlertResult<any>> {
    const title = this.translation.translate(`${key}.title`);
    const messageTemplate = this.translation.translate(`${key}.message`);
    const message = this.interpolate(messageTemplate, params);
    return this.error(title, message);
  }

  async info(title: string, text?: string, timer = 2000): Promise<SweetAlertResult<any>> {
    return Swal.fire({ icon: 'info', title, text, timer, timerProgressBar: true });
  }

  async infoKey(key: string, params?: Record<string,string>, timer = 2000): Promise<SweetAlertResult<any>> {
    const title = this.translation.translate(`${key}.title`);
    const messageTemplate = this.translation.translate(`${key}.message`);
    const message = this.interpolate(messageTemplate, params);
    return this.info(title, message, timer);
  }

  async toast(message: string, icon: 'success' | 'error' | 'info' = 'info', timer = 2000) {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
    });
  }

  async toastKey(key: string, icon: 'success' | 'error' | 'info' = 'info', params?: Record<string,string>, timer = 2000) {
    const messageTemplate = this.translation.translate(`${key}.message`);
    const message = this.interpolate(messageTemplate, params) || '';
    return this.toast(message, icon, timer);
  }

  /**
   * Generic confirm wrapper. Accepts full SweetAlertOptions and returns the Swal promise.
   * Use this when you need advanced options (custom buttons, colors, html, etc.).
   */
  async confirm(options: SweetAlertOptions = {}): Promise<SweetAlertResult<any>> {
    const defaultCfg: SweetAlertOptions = {
      icon: 'warning',
      title: options.title || 'Are you sure?',
      text: options.text || '',
      showCancelButton: options.showCancelButton ?? true,
      confirmButtonText: options.confirmButtonText || 'Yes',
      cancelButtonText: options.cancelButtonText || 'Cancel',
    };
    const cfg = { ...defaultCfg, ...options } as SweetAlertOptions;
    return Swal.fire(cfg);
  }

  /**
   * Confirm by translation key (key should point to an object with title/text/confirmButtonText/cancelButtonText)
   */
  async confirmKey(key: string, params?: Record<string,string>, overrides: SweetAlertOptions = {}): Promise<SweetAlertResult<any>> {
    const title = this.interpolate(this.translation.translate(`${key}.title`), params) || undefined;
    const text = this.interpolate(this.translation.translate(`${key}.message`), params) || undefined;
    const confirmButtonText = this.interpolate(this.translation.translate(`${key}.confirmButtonText`), params) || undefined;
    const cancelButtonText = this.interpolate(this.translation.translate(`${key}.cancelButtonText`), params) || undefined;
    const cfg: SweetAlertOptions = {
      ...overrides,
      title,
      text,
      confirmButtonText: confirmButtonText || overrides.confirmButtonText,
      cancelButtonText: cancelButtonText || overrides.cancelButtonText,
    };
    return this.confirm(cfg);
  }
}


