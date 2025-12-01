import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { TranslationService } from 'app/shared/services/translation/translation.service';

export interface LoadingSpinnerDialogData {
  message: string;
}

@Component({
  selector: 'app-loading-spinner-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TranslatePipe
  ],
  template: `
    <div class="loading-spinner-dialog">
      <div class="spinner-container">
        <mat-spinner diameter="44" strokeWidth="4" class="main-spinner"></mat-spinner>
        <div class="loading-content">
          <h3 class="loading-title">{{ 'shared.dashboard.loading.processing_title' | translate }}</h3>
          <p class="loading-message">{{ data.message }}</p>
          <div class="loading-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner-dialog {
      padding: 20px 22px;
      text-align: center;
      border-radius: 14px;
      position: relative;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(8px);
    }

    :host-context(.theme-dark) .loading-spinner-dialog {
      background: rgba(15, 23, 42, 0.60);
      color: #e5e7eb;
      border: 1px solid rgba(255,255,255,0.12);
    }

    :host-context(.theme-light) .loading-spinner-dialog {
      background: rgba(255, 255, 255, 0.88);
      color: #0f172a;
      border: 1px solid rgba(15,23,42,0.08);
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .main-spinner ::ng-deep circle {
      stroke: currentColor;
      stroke-linecap: round;
    }

    .loading-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .loading-message {
      font-size: 14px;
      margin: 4px 0 10px 0;
      opacity: 0.85;
      max-width: 280px;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
      opacity: 0.6;
      animation: bounce 1.4s ease-in-out infinite both;
    }

    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    .dot:nth-child(3) { animation-delay: 0s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1.15); opacity: 0.9; }
    }

    :host ::ng-deep .loading-dialog .mat-mdc-dialog-container {
      padding: 0;
      background: transparent;
      box-shadow: none;
    }

    :host ::ng-deep .loading-backdrop {
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(10px) saturate(1.05);
      -webkit-backdrop-filter: blur(10px) saturate(1.05);
      will-change: backdrop-filter;
    }
  `]
})
export class LoadingSpinnerDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LoadingSpinnerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingSpinnerDialogData,
    private translationService: TranslationService
  ) {}
}
