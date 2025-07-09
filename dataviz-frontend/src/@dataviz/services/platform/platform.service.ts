import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DatavizPlatformService {
    private _platformId = inject(PLATFORM_ID);

    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for isBrowser
     */
    get isBrowser(): boolean {
        return isPlatformBrowser(this._platformId);
    }

    /**
     * Getter for isServer
     */
    get isServer(): boolean {
        return !isPlatformBrowser(this._platformId);
    }

    /**
     * Getter for isMobile
     */
    get isMobile(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Getter for isDesktop
     */
    get isDesktop(): boolean {
        return !this.isMobile;
    }

    /**
     * Getter for isTablet
     */
    get isTablet(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        const userAgent = navigator.userAgent.toLowerCase();
        return /ipad|android(?!.*mobile)/i.test(userAgent);
    }

    /**
     * Getter for isIOS
     */
    get isIOS(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    /**
     * Getter for isAndroid
     */
    get isAndroid(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        return /Android/.test(navigator.userAgent);
    }

    /**
     * Getter for isSafari
     */
    get isSafari(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    }

    /**
     * Getter for isChrome
     */
    get isChrome(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    }

    /**
     * Getter for isFirefox
     */
    get isFirefox(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        return /Firefox/.test(navigator.userAgent);
    }

    /**
     * Getter for isEdge
     */
    get isEdge(): boolean {
        if (!this.isBrowser) {
            return false;
        }

        return /Edge/.test(navigator.userAgent);
    }
} 