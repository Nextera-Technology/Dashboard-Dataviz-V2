import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../services/translation/translation.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey?: string;
  private lastValue?: string;
  private sub?: Subscription;

  constructor(private translation: TranslationService, private cdr: ChangeDetectorRef) {
    // when translations load, re-evaluate pipe
    this.sub = this.translation.translationsLoaded$.subscribe(() => {
      // clear cached value so pipe will re-resolve keys after translations load
      this.lastKey = undefined;
      this.lastValue = undefined;
      // schedule change detection on next microtask to avoid change-detection assertion
      Promise.resolve().then(() => {
        try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }
      });
    });
  }

  transform(key: string): string {
    if (!key) return key;

    // quick path: if same key as last time, return cached value
    if (this.lastKey === key && this.lastValue !== undefined) {
      return this.lastValue;
    }

    const translated = this.translation.translate(key);

    // If translation not available yet, do not cache a value so pipe will retry
    if (translated === key) {
      this.lastKey = key;
      this.lastValue = undefined;
      return '';
    }

    this.lastKey = key;
    this.lastValue = translated;
    return translated;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}


