import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ],
  template: `
    <div class="loading-spinner-dialog">
      <div class="spinner-container">
        <div class="spinner-wrapper">
          <mat-spinner diameter="60" strokeWidth="4" class="main-spinner"></mat-spinner>
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
        </div>
        
        <div class="loading-content">
          <div class="loading-icon">
            <mat-icon class="dashboard-icon">dashboard</mat-icon>
          </div>
          <h3 class="loading-title">Processing Request</h3>
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
      padding: 40px 30px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .loading-spinner-dialog::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }

    .spinner-container {
      position: relative;
      z-index: 1;
    }

    .spinner-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 30px;
    }

    .main-spinner {
      position: relative;
      z-index: 3;
    }

    .main-spinner ::ng-deep circle {
      stroke: #ffffff;
      stroke-linecap: round;
    }

    .pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .pulse-ring.delay-1 {
      animation-delay: 0.5s;
      width: 100px;
      height: 100px;
      border-width: 1px;
    }

    .pulse-ring.delay-2 {
      animation-delay: 1s;
      width: 120px;
      height: 120px;
      border-width: 1px;
    }

    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.4);
        opacity: 0;
      }
    }

    .loading-content {
      position: relative;
      z-index: 2;
    }

    .loading-icon {
      margin-bottom: 16px;
    }

    .dashboard-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: rgba(255, 255, 255, 0.9);
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .loading-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .loading-message {
      font-size: 16px;
      margin: 0 0 24px 0;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
      max-width: 300px;
      margin-left: auto;
      margin-right: auto;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      animation: bounce 1.4s ease-in-out infinite both;
    }

    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    .dot:nth-child(3) { animation-delay: 0s; }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }

    /* Global dialog styles */
    :host ::ng-deep .loading-dialog .mat-mdc-dialog-container {
      padding: 0;
      background: transparent;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    :host ::ng-deep .loading-backdrop {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }
  `]
})
export class LoadingSpinnerDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LoadingSpinnerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingSpinnerDialogData
  ) {}
}
