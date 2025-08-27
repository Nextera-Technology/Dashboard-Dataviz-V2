import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RepositoryFactory } from '@dataviz/repositories/repository.factory';

export interface UserFormData {
  id?: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="user-form" autocomplete="off">
      <div class="header">
        <h3>{{ data?.id ? 'Edit user' : 'Add user' }}</h3>
      </div>

      <div class="row">
        <mat-form-field appearance="outline" class="col">
          <mat-label>First name</mat-label>
          <input matInput formControlName="firstName" placeholder="First name" />
          <mat-error *ngIf="form.controls.firstName.invalid && form.controls.firstName.touched">First name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="col">
          <mat-label>Last name</mat-label>
          <input matInput formControlName="lastName" placeholder="Last name" />
          <mat-error *ngIf="form.controls.lastName.invalid && form.controls.lastName.touched">Last name is required</mat-error>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" placeholder="email@example.com" />
        <mat-error *ngIf="form.controls.email.invalid && form.controls.email.touched">Enter a valid email</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full" *ngIf="!data?.id">
        <mat-label>Password</mat-label>
        <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Create a password" />
        <button mat-icon-button matSuffix type="button" (click)="togglePasswordVisibility()" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
        </button>
        <mat-error *ngIf="form.controls.password.invalid && form.controls.password.touched">Password is required</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Role</mat-label>
        <mat-select formControlName="role">
          <mat-option *ngFor="let r of roles" [value]="r.roleName">{{ r.roleName }}</mat-option>
          <mat-option *ngIf="roles.length === 0" value="visitor">Visitor</mat-option>
        </mat-select>
      </mat-form-field>

      <div class="actions">
        <button mat-stroked-button color="primary" type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="accent" type="submit" [disabled]="form.invalid">{{ data?.id ? 'Save changes' : 'Create user' }}</button>
      </div>
    </form>
  `,
  styles: [
    `
    :host { display: block; box-sizing: border-box; }
    .user-form { width: 720px; max-width: calc(100vw - 32px); padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 12px 36px rgba(2,6,23,0.12); max-height: calc(100vh - 80px); overflow: auto; box-sizing: border-box; }
    .header h3 { margin:0 0 12px 0; font-size:1.125rem; font-weight:800; }
    .row { display:flex; gap:16px; margin-bottom:12px; align-items: flex-start; }
    .col { flex:1; min-width:0; }
    .full { width:100%; margin-bottom:12px; }
    mat-form-field { width:100%; }
    /* ensure input elements have enough height and padding to avoid cropping */
    input.mat-input-element, textarea.mat-input-element { padding: 12px 14px; height: 44px; line-height: 20px; box-sizing: border-box; }
    /* Outline field visual improvements */
    .mat-form-field-appearance-outline .mat-form-field-outline { border-radius: 8px; }
    mat-form-field.mat-form-field { font-size: 0.95rem; }
    .actions { display:flex; justify-content:flex-end; gap:12px; margin-top:18px; }
    button[mat-flat-button] { min-width:140px; }
    /* make sure dialog container doesn't clip on small screens */
    :host ::ng-deep .mat-dialog-container { padding: 0 !important; }
    @media (max-width: 760px) { .user-form { width: calc(100vw - 24px); padding:16px; } .row { flex-direction:column; } }
    `
  ]
})
export class UserFormDialogComponent implements OnInit {
  form: FormGroup;
  roles: Array<{ id: string; roleName: string }> = [];
  private userRepo: any;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.form = this.fb.group({
      firstName: [data?.name ? (data.name.split(' ')[0] || '') : '', Validators.required],
      lastName: [data?.name ? (data.name.split(' ').slice(1).join(' ') || '') : '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: ['', data && data.id ? [] : [Validators.required]],
      role: [data?.role || 'visitor', Validators.required],
    });

    // create repository via factory to fetch role types
    this.userRepo = RepositoryFactory.createRepository('user');
  }

  ngOnInit() {
    if (this.userRepo?.getAllUserTypes) {
      this.userRepo.getAllUserTypes()
        .then((types: any[]) => {
          this.roles = types || [];
        })
        .catch(() => {
          this.roles = [{ id: 'visitor', roleName: 'Visitor' }, { id: 'operator', roleName: 'Operator' }];
        });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.form.valid) {
      const fv = this.form.value;
      const out: UserFormData = {
        id: this.data?.id,
        name: `${fv.firstName}${fv.lastName ? ' ' + fv.lastName : ''}`.trim(),
        email: fv.email,
        role: fv.role,
      };
      // include password when creating
      if (fv.password) (out as any).password = fv.password;
      this.dialogRef.close(out);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
