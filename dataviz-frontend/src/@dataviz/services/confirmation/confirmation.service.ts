import { Injectable, Injector } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

export interface DatavizConfirmationConfig {
    title?: string;
    message?: string;
    icon?: {
        show?: boolean;
        name?: string;
        color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
    };
    actions?: {
        confirm?: {
            show?: boolean;
            label?: string;
            color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
        };
        cancel?: {
            show?: boolean;
            label?: string;
            color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
        };
    };
    dismissible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DatavizConfirmationService {
    private _defaultConfig: DatavizConfirmationConfig = {
        title: 'Confirm action',
        message: 'Are you sure you want to confirm this action?',
        icon: {
            show: true,
            name: 'heroicons_outline:exclamation-triangle',
            color: 'warn',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Confirm',
                color: 'primary',
            },
            cancel: {
                show: true,
                label: 'Cancel',
                color: 'basic',
            },
        },
        dismissible: false,
    };

    /**
     * Constructor
     */
    constructor(private _matDialog: MatDialog, private _injector: Injector) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Opens the confirmation dialog
     *
     * @param config
     */
    open(config: DatavizConfirmationConfig = {}): Observable<boolean> {
        // Merge the user config with the default config
        const finalConfig = this._mergeConfigs(this._defaultConfig, config);

        // TODO: Implement confirmation dialog component
        // For now, return a simple confirmation
        return new Observable(observer => {
            // Use NotificationService.confirm instead of window.confirm for better UX.
            // Dynamically import NotificationService to avoid circular DI issues in providers.
            import('@dataviz/services/notification/notification.service').then((mod) => {
                const NotificationServiceClass = mod.NotificationService;
                const svc = this._injector.get(NotificationServiceClass);
                svc.confirm({ title: finalConfig.title, text: finalConfig.message }).then(res => {
                    observer.next(!!res.isConfirmed);
                    observer.complete();
                }).catch(err => {
                    console.error('Confirmation error:', err);
                    observer.next(false);
                    observer.complete();
                });
            }).catch(err => {
                console.error('Failed to load NotificationService:', err);
                // Fallback to window.confirm but keep it synchronous for backwards compat
                const confirmed = window.confirm(finalConfig.message || 'Are you sure?');
                observer.next(confirmed);
                observer.complete();
            });
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Merge configurations
     *
     * @param defaultConfig
     * @param userConfig
     */
    private _mergeConfigs(
        defaultConfig: DatavizConfirmationConfig,
        userConfig: DatavizConfirmationConfig
    ): DatavizConfirmationConfig {
        return {
            ...defaultConfig,
            ...userConfig,
            icon: {
                ...defaultConfig.icon,
                ...userConfig.icon,
            },
            actions: {
                ...defaultConfig.actions,
                ...userConfig.actions,
                confirm: {
                    ...defaultConfig.actions?.confirm,
                    ...userConfig.actions?.confirm,
                },
                cancel: {
                    ...defaultConfig.actions?.cancel,
                    ...userConfig.actions?.cancel,
                },
            },
        };
    }
} 