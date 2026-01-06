import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { RepositoryFactory } from '@dataviz/repositories/repository.factory';
import { TranslationService } from 'app/shared/services/translation/translation.service';

export interface UserFormData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TranslatePipe],
  template: `
    <div class="dashboard-form-dialog flex flex-col bg-white rounded-xl border border-gray-200 overflow-y-auto max-w-3xl w-full mx-auto">
      <!-- Header -->
      <div class="header flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ data?.id ? ('admin.userManagement.form.edit_title' | translate) : ('admin.userManagement.form.create_title' | translate) }}</h2>
          <p class="text-sm text-gray-500">{{ 'admin.userManagement.form.subtitle' | translate }}</p>
        </div>
        <button (click)="onCancel()" class="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex-grow">
        <div class="py-6 px-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.userManagement.form.first_name_label' | translate }} <span *ngIf="form.get('firstName')?.hasError('required') && form.get('firstName')?.touched" class="text-red-600">*</span></label>
              <input formControlName="firstName" placeholder="{{ 'admin.userManagement.form.first_name_placeholder' | translate }}" class="w-full px-4 py-3 border border-gray-300 outline-none rounded-lg shadow-sm placeholder-gray-400 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.userManagement.form.last_name_label' | translate }} <span *ngIf="form.get('lastName')?.hasError('required') && form.get('lastName')?.touched" class="text-red-600">*</span></label>
              <input formControlName="lastName" placeholder="{{ 'admin.userManagement.form.last_name_placeholder' | translate }}" class="w-full px-4 py-3 border border-gray-300 outline-none rounded-lg shadow-sm placeholder-gray-400 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.userManagement.form.email_label' | translate }} <span *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-red-600">*</span></label>
            <input formControlName="email" placeholder="{{ 'admin.userManagement.form.email_placeholder' | translate }}" class="w-full px-4 py-3 border border-gray-300 outline-none rounded-lg shadow-sm placeholder-gray-400 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm" />
          </div>

          <div *ngIf="!data?.id">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.userManagement.form.password_label' | translate }} <span *ngIf="form.get('password')?.hasError('required') && form.get('password')?.touched" class="text-red-600">*</span></label>
            <input formControlName="password" type="password" placeholder="{{ 'admin.userManagement.form.password_placeholder' | translate }}" class="w-full px-4 py-3 border border-gray-300 outline-none rounded-lg shadow-sm placeholder-gray-400 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.userManagement.form.role_label' | translate }}</label>
            <select formControlName="role" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm bg-white">
              <option *ngFor="let r of rolesDisplayed" [value]="r.roleName">{{ r.label }}</option>
              <option *ngIf="rolesDisplayed.length === 0" value="visitor">{{ 'admin.userManagement.roles.visitor' | translate }}</option>
            </select>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
          <button type="button" (click)="onCancel()" class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md">
            {{ 'admin.userManagement.form.cancel' | translate }}
          </button>
          <button type="submit" [disabled]="form.invalid" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200">
            {{ data?.id ? ('admin.userManagement.form.save_changes' | translate) : ('admin.userManagement.form.create_user' | translate) }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
    .user-form { width: 520px; max-width: calc(100vw - 48px); }
    @media (max-width: 520px) { .flex-1 { min-width: 0; } .flex { flex-direction: column; } }

    :host ::ng-deep .mat-mdc-dialog-container { background: transparent; }

    .dashboard-form-dialog { background: var(--bg-primary) !important; border-color: var(--border-color) !important; }
    .dashboard-form-dialog .header { background: linear-gradient(135deg, var(--primary-light), var(--primary-dark)) !important; color: #ffffff !important; border-bottom: 1px solid var(--border-color) !important; }
    .dashboard-form-dialog .header h2 { color: #ffffff !important; }
    .dashboard-form-dialog .header .text-sm { color: rgba(255,255,255,0.85) !important; }

    .dashboard-form-dialog input,
    .dashboard-form-dialog select { color: var(--text-primary) !important; background: var(--bg-primary) !important; border-color: var(--border-color) !important; }
    .dashboard-form-dialog input::placeholder { color: var(--text-muted) !important; }
    .dashboard-form-dialog input:-webkit-autofill,
    .dashboard-form-dialog input:-webkit-autofill:hover,
    .dashboard-form-dialog input:-webkit-autofill:focus,
    .dashboard-form-dialog select:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px var(--bg-primary) inset !important; -webkit-text-fill-color: var(--text-primary) !important; caret-color: var(--text-primary) !important; }

    .dashboard-form-dialog .px-8.py-6.bg-gray-50 { background: var(--bg-primary) !important; border-top: 1px solid var(--border-color) !important; }
    .dashboard-form-dialog .px-6.py-2\\.5.bg-blue-600 { background: var(--primary-dark) !important; }
    .dashboard-form-dialog .px-6.py-2\\.5.text-gray-700.bg-white { color: var(--text-primary) !important; background: var(--bg-primary) !important; border-color: var(--border-color) !important; }
    `
  ]
})
export class UserFormDialogComponent implements OnInit {
  form: FormGroup;
  roles: Array<{ id: string; roleName: string }> = [];
  rolesDisplayed: Array<{ id: string; roleName: string; label: string }> = [];
  private userRepo: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
    , private translation: TranslationService
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
          this.rolesDisplayed = (this.roles || []).map(r => {
            const key = `admin.userManagement.roles.${(r.roleName || '').toLowerCase()}`;
            const translated = this.translation.translate(key);
            const label = (translated && translated !== key) ? translated : ((r.roleName || '') ? (r.roleName.charAt(0).toUpperCase() + r.roleName.slice(1).toLowerCase()) : '');
            return { id: r.id, roleName: r.roleName, label };
          });
        })
        .catch(() => {
          this.roles = [{ id: 'visitor', roleName: 'Visitor' }, { id: 'operator', roleName: 'Operator' }];
          this.rolesDisplayed = this.roles.map(r => ({ id: r.id, roleName: r.roleName, label: r.roleName }));
        });
    }
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
