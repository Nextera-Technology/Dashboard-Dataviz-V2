import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DatavizUtilsService {
    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generate a random ID
     */
    randomId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Generate a random number between min and max
     *
     * @param min
     * @param max
     */
    randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate a random string
     *
     * @param length
     */
    randomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Generate a random color
     */
    randomColor(): string {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    /**
     * Generate a random date between start and end
     *
     * @param start
     * @param end
     */
    randomDate(start: Date, end: Date): Date {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    /**
     * Format a number with commas
     *
     * @param num
     */
    formatNumber(num: number): string {
        return num.toLocaleString();
    }

    /**
     * Format a currency
     *
     * @param amount
     * @param currency
     */
    formatCurrency(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }

    /**
     * Format a percentage
     *
     * @param value
     * @param decimals
     */
    formatPercentage(value: number, decimals: number = 2): string {
        return value.toFixed(decimals) + '%';
    }

    /**
     * Format a date
     *
     * @param date
     * @param format
     */
    formatDate(date: Date, format: string = 'short'): string {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: format as any,
        }).format(date);
    }

    /**
     * Format a time
     *
     * @param date
     * @param format
     */
    formatTime(date: Date, format: string = 'short'): string {
        return new Intl.DateTimeFormat('en-US', {
            timeStyle: format as any,
        }).format(date);
    }

    /**
     * Format a date and time
     *
     * @param date
     * @param format
     */
    formatDateTime(date: Date, format: string = 'short'): string {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: format as any,
            timeStyle: format as any,
        }).format(date);
    }

    /**
     * Get the file size in a human readable format
     *
     * @param bytes
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get the time ago from a date
     *
     * @param date
     */
    timeAgo(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return diffInSeconds + ' seconds ago';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return diffInMinutes + ' minutes ago';
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return diffInHours + ' hours ago';
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return diffInDays + ' days ago';
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return diffInWeeks + ' weeks ago';
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return diffInMonths + ' months ago';
        }

        const diffInYears = Math.floor(diffInDays / 365);
        return diffInYears + ' years ago';
    }

    /**
     * Debounce a function
     *
     * @param func
     * @param wait
     */
    debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
        let timeout: number;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Throttle a function
     *
     * @param func
     * @param limit
     */
    throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }
} 