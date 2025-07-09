import { Injectable } from '@angular/core';
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
    constructor(private _matDialog: MatDialog) {}

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
            const confirmed = confirm(finalConfig.message || 'Are you sure?');
            observer.next(confirmed);
            observer.complete();
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