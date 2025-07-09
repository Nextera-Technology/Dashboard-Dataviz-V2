import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DatavizLoadingService {
    private _autoMode: boolean = true;
    private _mode: 'determinate' | 'indeterminate' = 'indeterminate';
    private _progress: number = 0;
    private _show: boolean = false;
    private _url: string = '**';

    private _auto$ = new BehaviorSubject<boolean>(this._autoMode);
    private _mode$ = new BehaviorSubject<'determinate' | 'indeterminate'>(this._mode);
    private _progress$ = new BehaviorSubject<number>(this._progress);
    private _show$ = new BehaviorSubject<boolean>(this._show);
    private _url$ = new BehaviorSubject<string>(this._url);

    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for auto mode
     */
    get auto$(): Observable<boolean> {
        return this._auto$.asObservable();
    }

    /**
     * Getter for mode
     */
    get mode$(): Observable<'determinate' | 'indeterminate'> {
        return this._mode$.asObservable();
    }

    /**
     * Getter for progress
     */
    get progress$(): Observable<number> {
        return this._progress$.asObservable();
    }

    /**
     * Getter for show
     */
    get show$(): Observable<boolean> {
        return this._show$.asObservable();
    }

    /**
     * Getter for url
     */
    get url$(): Observable<string> {
        return this._url$.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Hide the loading bar
     */
    hide(): void {
        this._show = false;
        this._show$.next(this._show);
    }

    /**
     * Set the auto mode
     *
     * @param value
     */
    setAutoMode(value: boolean): void {
        this._autoMode = value;
        this._auto$.next(this._autoMode);
    }

    /**
     * Set the mode
     *
     * @param value
     */
    setMode(value: 'determinate' | 'indeterminate'): void {
        this._mode = value;
        this._mode$.next(this._mode);
    }

    /**
     * Set the progress of the loading bar
     *
     * @param value
     */
    setProgress(value: number): void {
        this._progress = value;
        this._progress$.next(this._progress);
    }

    /**
     * Set the show status
     *
     * @param value
     */
    setShow(value: boolean): void {
        this._show = value;
        this._show$.next(this._show);
    }

    /**
     * Set the url
     *
     * @param value
     */
    setUrl(value: string): void {
        this._url = value;
        this._url$.next(this._url);
    }

    /**
     * Show the loading bar
     */
    show(): void {
        this._show = true;
        this._show$.next(this._show);
    }
} 