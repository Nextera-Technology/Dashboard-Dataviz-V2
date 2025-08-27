import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private supportedLanguages = ['en', 'fr'];
  private translations: Record<string, any> = {};
  public currentLanguage$ = new BehaviorSubject<string>('en');
  // emits language code when its translations finished loading
  public translationsLoaded$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('app_lang');
    const lang = stored ?? this.detectBrowserLanguage();
    this.setLanguage(lang);
  }

  private detectBrowserLanguage(): string {
    const nav = (navigator && (navigator.language || (navigator as any).userLanguage)) || 'en';
    if (nav.startsWith('fr')) return 'fr';
    return 'en';
  }

  setLanguage(lang: string): void {
    const normalized = this.supportedLanguages.includes(lang) ? lang : 'en';
    this.currentLanguage$.next(normalized);
    localStorage.setItem('app_lang', normalized);
    // load translations if not yet loaded
    if (!this.translations[normalized]) {
      // Try absolute URL first (works reliably with different base hrefs)
      const primary = `${window.location.origin}/assets/localization/${normalized}.json`;
      const relative = `assets/localization/${normalized}.json`;
      console.debug('[TranslationService] loading', primary);
      this.http.get<Record<string, any>>(primary).subscribe({
        next: (data) => {
          console.debug('[TranslationService] loaded (primary)', normalized, data ? Object.keys(data).length : 0);
          this.translations[normalized] = data;
          this.translationsLoaded$.next(normalized);
        },
        error: (err) => {
          console.warn('[TranslationService] primary absolute load failed', primary, err);
          // try relative path
          console.debug('[TranslationService] trying relative', relative);
          this.http.get<Record<string, any>>(relative).subscribe({
            next: (data2) => {
              console.debug('[TranslationService] loaded (relative)', normalized, data2 ? Object.keys(data2).length : 0);
              this.translations[normalized] = data2;
              this.translationsLoaded$.next(normalized);
            },
            error: (err2) => {
              console.warn('[TranslationService] relative load failed', relative, err2);
              this.translations[normalized] = {};
              this.translationsLoaded$.next(normalized);
            }
          });
        },
      });
      
    } else {
      // if already loaded, emit immediately
      this.translationsLoaded$.next(normalized);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage$.value;
  }

  translate(key: string): string {
    const lang = this.getCurrentLanguage();
    const tree = this.translations[lang] ?? {};
    const parts = key.split('.');
    let cur: any = tree;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        cur = null;
        break;
      }
    }
    return cur ?? key;
  }
}


