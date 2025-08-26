import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async success(title: string, text?: string, timer = 2000): Promise<SweetAlertResult<any>> {
    return Swal.fire({ icon: 'success', title, text, timer, timerProgressBar: true });
  }

  async error(title: string, text?: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({ icon: 'error', title, text });
  }

  async info(title: string, text?: string, timer = 2000): Promise<SweetAlertResult<any>> {
    return Swal.fire({ icon: 'info', title, text, timer, timerProgressBar: true });
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
}


