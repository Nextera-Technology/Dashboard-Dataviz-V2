import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface SectionFormData {
  id?: string;
  title: string;
  background: string;
}

@Component({
  selector: 'app-section-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Section' : 'Add New Section' }}</h2>
    
    <form [formGroup]="sectionForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter section title">
            <mat-error *ngIf="sectionForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Background Color</mat-label>
            <input matInput formControlName="background" placeholder="#ffffff" type="color">
            <mat-error *ngIf="sectionForm.get('background')?.hasError('required')">
              Background color is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <label>Preview:</label>
          <div class="background-preview" [style.background-color]="sectionForm.get('background')?.value">
            <span>{{sectionForm.get('title')?.value || 'Section Title'}}</span>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="sectionForm.invalid">
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

    .background-preview {
      padding: 16px;
      border-radius: 8px;
      margin-top: 8px;
      text-align: center;
      font-weight: 500;
      color: #333;
      border: 1px solid #ddd;
    }

    mat-dialog-content {
      min-width: 400px;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class SectionFormDialogComponent implements OnInit {
  sectionForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SectionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SectionFormData
  ) {
    this.sectionForm = this.fb.group({
      title: ['', Validators.required],
      background: ['#ffffff', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.isEditMode = true;
      this.sectionForm.patchValue({
        title: this.data.title,
        background: this.data.background
      });
    }
  }

  onSubmit(): void {
    if (this.sectionForm.valid) {
      const formData: SectionFormData = {
        ...this.sectionForm.value,
        id: this.data.id
      };
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 