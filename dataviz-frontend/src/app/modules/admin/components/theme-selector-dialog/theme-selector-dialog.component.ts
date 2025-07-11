import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

export interface ThemeOption {
  value: 'light' | 'dark';
  label: string;
  icon: string;
  description: string;
}

export interface ThemeSelectorData {
  currentTheme: 'light' | 'dark';
  availableThemes: ThemeOption[];
}

@Component({
  selector: 'app-theme-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatRadioModule,
    FormsModule
  ],
  template: `
    <div class="theme-selector-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>palette</mat-icon>
          Choose Dashboard Theme
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="theme-options">
          <div class="theme-option" 
               *ngFor="let theme of data.availableThemes"
               [class.selected]="selectedTheme === theme.value"
               (click)="selectTheme(theme.value)">
            
            <div class="theme-preview" [class]="theme.value">
              <div class="preview-header">
                <div class="preview-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
                <mat-icon>{{ theme.icon }}</mat-icon>
              </div>
              <div class="preview-content">
                <div class="preview-widget small"></div>
                <div class="preview-widget medium"></div>
                <div class="preview-widget large"></div>
              </div>
            </div>

            <div class="theme-info">
              <div class="theme-radio">
                <mat-radio-button
                  [value]="theme.value"
                  [checked]="selectedTheme === theme.value"
                  name="theme"
                  (click)="selectTheme(theme.value)">
                  {{ theme.label }}
                </mat-radio-button>
              </div>
              <p class="theme-description">{{ theme.description }}</p>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button 
                color="primary" 
                [disabled]="selectedTheme === data.currentTheme"
                (click)="applyTheme()">
          Apply Theme
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .theme-selector-dialog {
      min-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 20px;
      color: #333;
    }

    mat-dialog-content {
      padding: 24px;
    }

    .theme-options {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .theme-option {
      flex: 1;
      min-width: 250px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .theme-option:hover {
      border-color: #2196F3;
      box-shadow: 0 4px 8px rgba(33, 150, 243, 0.1);
    }

    .theme-option.selected {
      border-color: #2196F3;
      background-color: #f3f8ff;
    }

    .theme-preview {
      width: 100%;
      height: 120px;
      border-radius: 6px;
      margin-bottom: 12px;
      overflow: hidden;
      position: relative;
    }

    .theme-preview.light {
      background: #ffffff;
      border: 1px solid #e0e0e0;
    }

    .theme-preview.dark {
      background: #1a1a1a;
      border: 1px solid #333;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid;
    }

    .preview-header.light {
      border-bottom-color: #e0e0e0;
    }

    .preview-header.dark {
      border-bottom-color: #333;
    }

    .preview-dots {
      display: flex;
      gap: 4px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ccc;
    }

    .preview-header mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .preview-content {
      padding: 12px;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .preview-widget {
      border-radius: 4px;
    }

    .preview-widget.small {
      width: 20%;
      height: 20px;
    }

    .preview-widget.medium {
      width: 30%;
      height: 30px;
    }

    .preview-widget.large {
      width: 40%;
      height: 40px;
    }

    .preview-widget.light {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
    }

    .preview-widget.dark {
      background: #2a2a2a;
      border: 1px solid #444;
    }

    .theme-info {
      text-align: center;
    }

    .theme-radio {
      margin-bottom: 8px;
    }

    .theme-description {
      margin: 0;
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class ThemeSelectorDialogComponent {
  selectedTheme: 'light' | 'dark';

  constructor(
    public dialogRef: MatDialogRef<ThemeSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ThemeSelectorData
  ) {
    this.selectedTheme = data.currentTheme;
  }

  selectTheme(theme: 'light' | 'dark'): void {
    this.selectedTheme = theme;
  }

  applyTheme(): void {
    this.dialogRef.close(this.selectedTheme);
  }
} 