import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

export interface SchoolSelectionDialogData {
  dashboardId: string;
  dashboardTitle: string;
}

export interface SchoolSelectionResult {
  openWithAllData: boolean;
  selectedSchools: string[];
}

@Component({
  selector: 'app-school-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatRadioModule
  ],
  template: `
    <div class="school-selection-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title class="dialog-title">
          <mat-icon class="title-icon">school</mat-icon>
          Open Dashboard
        </h2>
        <p class="dialog-subtitle">{{ data.dashboardTitle }}</p>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="selection-options">
          <div class="option-card" [class.selected]="selectedOption === 'all'" (click)="selectedOption = 'all'">
            <mat-radio-button value="all" [(ngModel)]="selectedOption" class="option-radio">
              <div class="option-content">
                <div class="option-header">
                  <mat-icon class="option-icon">public</mat-icon>
                  <span class="option-title">Open with all school data</span>
                </div>
                <p class="option-description">View dashboard with complete dataset from all schools</p>
              </div>
            </mat-radio-button>
          </div>

          <div class="option-card" [class.selected]="selectedOption === 'selected'" (click)="selectedOption = 'selected'">
            <mat-radio-button value="selected" [(ngModel)]="selectedOption" class="option-radio">
              <div class="option-content">
                <div class="option-header">
                  <mat-icon class="option-icon">filter_list</mat-icon>
                  <span class="option-title">Open with selected schools</span>
                </div>
                <p class="option-description">Filter dashboard data by specific schools</p>
              </div>
            </mat-radio-button>
          </div>
        </div>

        <div class="school-selection" *ngIf="selectedOption === 'selected'">
          <h3 class="selection-title">
            <mat-icon>location_city</mat-icon>
            Select Schools
          </h3>
          <div class="schools-list">
            <div class="school-item" *ngFor="let school of availableSchools">
              <mat-checkbox 
                [(ngModel)]="schoolSelections[school]"
                (change)="onSchoolSelectionChange()"
                class="school-checkbox">
                {{ school }}
              </mat-checkbox>
            </div>
          </div>
          <div class="selection-info" *ngIf="selectedOption === 'selected'">
            <span class="selected-count">{{ getSelectedSchoolsCount() }} school(s) selected</span>
            <span class="requirement-note" *ngIf="getSelectedSchoolsCount() === 0">
              <mat-icon class="warning-icon">warning</mat-icon>
              Please select at least one school
            </span>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onConfirm()"
          [disabled]="!isValidSelection()"
          class="confirm-button">
          <mat-icon>open_in_new</mat-icon>
          Open Dashboard
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .school-selection-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .title-icon {
      color: #3b82f6;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .dialog-subtitle {
      color: #6b7280;
      font-size: 16px;
      margin: 8px 0 0 40px;
    }

    .dialog-content {
      padding: 24px;
      max-height: 500px;
      overflow-y: auto;
    }

    .selection-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .option-card {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f9fafb;
    }

    .option-card:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .option-card.selected {
      border-color: #3b82f6;
      background: #eff6ff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .option-radio {
      width: 100%;
    }

    .option-content {
      margin-left: 32px;
    }

    .option-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .option-icon {
      color: #3b82f6;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .option-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .option-description {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }

    .school-selection {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
    }

    .selection-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 16px 0;
    }

    .schools-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .school-item {
      padding: 8px 0;
    }

    .school-checkbox {
      font-size: 16px;
    }

    .selection-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .selected-count {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
    }

    .requirement-note {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #dc2626;
    }

    .warning-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .dialog-actions {
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-button {
      color: #6b7280;
    }

    .confirm-button {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      font-weight: 600;
    }

    .confirm-button:disabled {
      background: #9ca3af;
      color: #ffffff;
    }

    .confirm-button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class SchoolSelectionDialogComponent {
  selectedOption: 'all' | 'selected' = 'all';
  
  availableSchools = [
    'IEF2I',
    'KOUT QUE KOUT MONTPELLIER'
  ];

  schoolSelections: { [key: string]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<SchoolSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolSelectionDialogData
  ) {
    // Initialize school selections
    this.availableSchools.forEach(school => {
      this.schoolSelections[school] = false;
    });
  }

  onSchoolSelectionChange(): void {
    // This method is called when any school checkbox changes
    // We can add validation logic here if needed
  }

  getSelectedSchoolsCount(): number {
    return Object.values(this.schoolSelections).filter(selected => selected).length;
  }

  getSelectedSchools(): string[] {
    return this.availableSchools.filter(school => this.schoolSelections[school]);
  }

  isValidSelection(): boolean {
    if (this.selectedOption === 'all') {
      return true;
    }
    return this.getSelectedSchoolsCount() > 0;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    const result: SchoolSelectionResult = {
      openWithAllData: this.selectedOption === 'all',
      selectedSchools: this.selectedOption === 'selected' ? this.getSelectedSchools() : []
    };
    
    // Close dialog immediately and prevent backdrop click during processing
    this.dialogRef.disableClose = true;
    this.dialogRef.close(result);
  }
}
