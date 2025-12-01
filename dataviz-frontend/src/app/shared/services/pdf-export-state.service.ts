import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PdfExportState {
  isExporting: boolean;
  widgetId: string | null;
  widgetTitle: string | null;
  startTime: Date | null;
}

/**
 * Global service to track PDF export state across components
 * Prevents multiple simultaneous PDF exports and shows warnings when navigating during export
 */
@Injectable({ providedIn: 'root' })
export class PdfExportStateService {
  private readonly initialState: PdfExportState = {
    isExporting: false,
    widgetId: null,
    widgetTitle: null,
    startTime: null
  };

  private stateSubject = new BehaviorSubject<PdfExportState>(this.initialState);

  /** Observable of current PDF export state */
  state$: Observable<PdfExportState> = this.stateSubject.asObservable();

  /** Check if any PDF export is currently in progress */
  get isExporting(): boolean {
    return this.stateSubject.value.isExporting;
  }

  /** Get the widget ID being exported */
  get currentWidgetId(): string | null {
    return this.stateSubject.value.widgetId;
  }

  /** Get the widget title being exported */
  get currentWidgetTitle(): string | null {
    return this.stateSubject.value.widgetTitle;
  }

  /** Start tracking a PDF export */
  startExport(widgetId: string, widgetTitle?: string): void {
    this.stateSubject.next({
      isExporting: true,
      widgetId,
      widgetTitle: widgetTitle || null,
      startTime: new Date()
    });
  }

  /** Stop tracking the PDF export (success or failure) */
  endExport(): void {
    this.stateSubject.next(this.initialState);
  }

  /** Get elapsed time in seconds since export started */
  getElapsedSeconds(): number {
    const state = this.stateSubject.value;
    if (!state.startTime) return 0;
    return Math.floor((Date.now() - state.startTime.getTime()) / 1000);
  }
}
