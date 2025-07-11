import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SectionFormData {
  title: string;
  background: string;
}

@Component({
  selector: 'app-section-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="section-form-dialog">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Edit Section
      </h2>
      
      <form [formGroup]="sectionForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-fields">
            <!-- Title Field -->
            <mat-form-field class="full-width">
              <mat-label>Section Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter section title">
              <mat-error *ngIf="sectionForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>

            <!-- Background Color Field -->
            <mat-form-field class="full-width">
              <mat-label>Background Color</mat-label>
              <input matInput formControlName="background" placeholder="#f5f5f5">
              <mat-error *ngIf="sectionForm.get('background')?.hasError('required')">
                Background color is required
              </mat-error>
            </mat-form-field>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            Cancel
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="sectionForm.invalid">
            Save
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .section-form-dialog {
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

    mat-dialog-actions {
      margin-top: 24px;
      padding: 0;
    }
  `]
})
export class SectionFormDialogComponent {
  sectionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SectionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SectionFormData
  ) {
    this.sectionForm = this.fb.group({
      title: [data.title, Validators.required],
      background: [data.background, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.sectionForm.valid) {
      this.dialogRef.close(this.sectionForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 