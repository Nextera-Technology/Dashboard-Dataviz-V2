import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type DatavizMediaQuery = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

@Injectable({ providedIn: 'root' })
export class DatavizMediaWatcherService {
    private _onMediaQueryChange: BehaviorSubject<DatavizMediaQuery | null> = new BehaviorSubject<DatavizMediaQuery | null>(null);

    /**
     * Constructor
     */
    constructor() {
        this._init();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for onMediaQueryChange
     */
    get onMediaQueryChange$(): Observable<DatavizMediaQuery | null> {
        return this._onMediaQueryChange.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize the media watcher
     */
    private _init(): void {
        // Create the media query list
        const mediaQueryList = {
            'xs': window.matchMedia('(max-width: 599px)'),
            'sm': window.matchMedia('(min-width: 600px) and (max-width: 959px)'),
            'md': window.matchMedia('(min-width: 960px) and (max-width: 1279px)'),
            'lg': window.matchMedia('(min-width: 1280px) and (max-width: 1919px)'),
            'xl': window.matchMedia('(min-width: 1920px) and (max-width: 5000px)'),
            '2xl': window.matchMedia('(min-width: 2000px)'),
        };

        // Initial call
        this._onMediaQueryChange.next(this._getCurrentMediaQuery(mediaQueryList));

        // Listen for changes
        Object.keys(mediaQueryList).forEach((key) => {
            const mql = mediaQueryList[key as DatavizMediaQuery];
            mql.addEventListener('change', () => {
                this._onMediaQueryChange.next(this._getCurrentMediaQuery(mediaQueryList));
            });
        });
    }

    /**
     * Get the current media query
     *
     * @param mediaQueryList
     */
    private _getCurrentMediaQuery(mediaQueryList: Record<DatavizMediaQuery, MediaQueryList>): DatavizMediaQuery | null {
        for (const key of Object.keys(mediaQueryList)) {
            if (mediaQueryList[key as DatavizMediaQuery].matches) {
                return key as DatavizMediaQuery;
            }
        }
        return null;
    }
} 