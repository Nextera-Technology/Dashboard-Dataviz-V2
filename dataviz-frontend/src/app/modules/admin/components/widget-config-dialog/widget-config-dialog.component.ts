import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WidgetConfigData } from '../../../../shared/services/dashboard.service';

export interface WidgetConfigDialogData {
  title: string;
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'map';
  size: 'small' | 'medium' | 'large';
}

@Component({
  selector: 'app-widget-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="widget-config-dialog">
      <h2 mat-dialog-title>
        <mat-icon>settings</mat-icon>
        Configure Widget
      </h2>
      
      <form [formGroup]="configForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-fields">
            <!-- Title Field -->
            <mat-form-field class="full-width">
              <mat-label>Widget Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter widget title">
              <mat-error *ngIf="configForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>

            <!-- Size Fields -->
            <div class="size-fields">
              <mat-form-field>
                <mat-label>Rows</mat-label>
                <mat-select formControlName="rows">
                  <mat-option *ngFor="let row of rowOptions" [value]="row">
                    {{ row }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="configForm.get('rows')?.hasError('required')">
                  Rows is required
                </mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Columns</mat-label>
                <mat-select formControlName="columns">
                  <mat-option *ngFor="let col of columnOptions" [value]="col">
                    {{ col }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="configForm.get('columns')?.hasError('required')">
                  Columns is required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Widget Type Field -->
            <mat-form-field class="full-width">
              <mat-label>Widget Type</mat-label>
              <mat-select formControlName="type">
                <mat-option *ngFor="let type of widgetTypes" [value]="type.value">
                  <div class="widget-type-option">
                    <mat-icon>{{ type.icon }}</mat-icon>
                    <span>{{ type.label }}</span>
                  </div>
                </mat-option>
              </mat-select>
              <mat-error *ngIf="configForm.get('type')?.hasError('required')">
                Widget type is required
              </mat-error>
            </mat-form-field>

            <!-- Size Preview -->
            <div class="size-preview">
              <h4>Size Preview</h4>
              <div class="grid-preview" 
                   [style.grid-template-columns]="'repeat(' + configForm.get('columns')?.value + ', 1fr)'"
                   [style.grid-template-rows]="'repeat(' + configForm.get('rows')?.value + ', 1fr)'">
                <div class="preview-cell" 
                     *ngFor="let cell of previewCells"
                     [class.active]="cell.active">
                </div>
              </div>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            Cancel
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="configForm.invalid">
            Save
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .widget-config-dialog {
      min-width: 400px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .size-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .widget-type-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .widget-type-option mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .size-preview {
      margin-top: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .size-preview h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 14px;
    }

    .grid-preview {
      display: grid;
      gap: 4px;
      max-width: 200px;
      margin: 0 auto;
    }

    .preview-cell {
      aspect-ratio: 1;
      background: #e0e0e0;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .preview-cell.active {
      background: #2196F3;
    }

    mat-dialog-actions {
      margin-top: 24px;
      padding: 0;
    }

    @media (max-width: 480px) {
      .widget-config-dialog {
        min-width: 300px;
      }
      
      .size-fields {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WidgetConfigDialogComponent {
  configForm: FormGroup;
  
  rowOptions = [1, 2, 3, 4];
  columnOptions = [1, 2, 3, 4];
  
  widgetTypes = [
    { value: 'metric', label: 'Metric', icon: 'analytics' },
    { value: 'pie', label: 'Pie Chart', icon: 'pie_chart' },
    { value: 'bar', label: 'Bar Chart', icon: 'bar_chart' },
    { value: 'line', label: 'Line Chart', icon: 'show_chart' },
    { value: 'column', label: 'Column Chart', icon: 'stacked_bar_chart' },
    { value: 'sankey', label: 'Sankey Chart', icon: 'account_tree' },
    { value: 'table', label: 'Table', icon: 'table_chart' },
    { value: 'text', label: 'Text', icon: 'text_fields' },
    { value: 'map', label: 'Map', icon: 'map' }
  ];

  get previewCells(): Array<{active: boolean}> {
    const rows = this.configForm.get('rows')?.value || 1;
    const cols = this.configForm.get('columns')?.value || 1;
    const total = rows * cols;
    return Array.from({ length: 16 }, (_, i) => ({ active: i < total }));
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<WidgetConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WidgetConfigDialogData
  ) {
    // Convert size to rows/columns
    const sizeToGrid = {
      'small': { rows: 1, columns: 1 },
      'medium': { rows: 2, columns: 2 },
      'large': { rows: 3, columns: 3 }
    };
    
    const gridSize = sizeToGrid[data.size] || { rows: 1, columns: 1 };

    this.configForm = this.fb.group({
      title: [data.title, Validators.required],
      rows: [gridSize.rows, Validators.required],
      columns: [gridSize.columns, Validators.required],
      type: [data.type, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      const result: WidgetConfigData = {
        title: formValue.title,
        rows: formValue.rows,
        columns: formValue.columns,
        type: formValue.type
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 