import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export interface WidgetFormData {
  id?: string;
  title: string;
  dataSource: string;
  size: 'small' | 'medium' | 'large';
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'map';
  section: string;
}

@Component({
  selector: 'app-widget-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Widget' : 'Add New Widget' }}</h2>
    
    <form [formGroup]="widgetForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter widget title">
            <mat-error *ngIf="widgetForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Data Source</mat-label>
            <input matInput formControlName="dataSource" placeholder="Enter data source">
            <mat-error *ngIf="widgetForm.get('dataSource')?.hasError('required')">
              Data source is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Widget Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="metric">Metric</mat-option>
              <mat-option value="pie">Pie Chart</mat-option>
              <mat-option value="bar">Bar Chart</mat-option>
              <mat-option value="line">Line Chart</mat-option>
              <mat-option value="column">Column Chart</mat-option>
              <mat-option value="sankey">Sankey Chart</mat-option>
              <mat-option value="table">Table</mat-option>
              <mat-option value="text">Text</mat-option>
              <mat-option value="map">Map</mat-option>
            </mat-select>
            <mat-error *ngIf="widgetForm.get('type')?.hasError('required')">
              Widget type is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Size</mat-label>
            <mat-select formControlName="size">
              <mat-option value="small">Small</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="large">Large</mat-option>
            </mat-select>
            <mat-error *ngIf="widgetForm.get('size')?.hasError('required')">
              Size is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Section</mat-label>
            <input matInput formControlName="section" placeholder="Enter section name">
            <mat-error *ngIf="widgetForm.get('section')?.hasError('required')">
              Section is required
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="widgetForm.invalid">
          {{ isEditMode ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-row {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 500px;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class WidgetFormDialogComponent implements OnInit {
  widgetForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<WidgetFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WidgetFormData
  ) {
    this.widgetForm = this.fb.group({
      title: ['', Validators.required],
      dataSource: ['', Validators.required],
      type: ['metric', Validators.required],
      size: ['medium', Validators.required],
      section: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.isEditMode = true;
      this.widgetForm.patchValue({
        title: this.data.title,
        dataSource: this.data.dataSource,
        type: this.data.type,
        size: this.data.size,
        section: this.data.section
      });
    }
  }

  onSubmit(): void {
    if (this.widgetForm.valid) {
      const formData: WidgetFormData = {
        ...this.widgetForm.value,
        id: this.data.id
      };
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 