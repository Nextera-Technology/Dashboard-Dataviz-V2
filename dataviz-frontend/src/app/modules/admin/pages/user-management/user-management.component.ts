import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserFormDialogComponent, UserFormData } from '../../components/user-form-dialog/user-form-dialog.component';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { AuthService, User, CreateUserData, UpdateUserData } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout>
      <div class="user-management">
        <div class="um-toolbar">
          <div class="um-title">
            <h1>User Management</h1>
            <div class="um-sub">Manage users, roles, and access</div>
          </div>

          <div class="um-actions">
            <mat-form-field appearance="outline" class="search-field">
              <mat-icon matPrefix>search</mat-icon>
              <input matInput placeholder="Search users by name or email" (input)="onSearchInput($event)" [value]="searchValue" />
              <button mat-icon-button matSuffix *ngIf="searchValue" aria-label="Clear search" (click)="clearSearch()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>

            <div class="um-stats">
              <div class="stat">
                <div class="num">{{dataSource?.data?.length || 0}}</div>
                <div class="label">Users</div>
              </div>
            </div>

            <button mat-raised-button color="primary" class="add-button" (click)="openAddDialog()">
              <mat-icon>person_add</mat-icon>
              <span>Add User</span>
            </button>
          </div>
        </div>

        <mat-card class="user-card">
          <mat-card-content>
            <div class="table-wrap">
              <table mat-table [dataSource]="dataSource" matSort class="user-table" matSortDisableClear>

                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                  <td mat-cell *matCellDef="let user">{{user.name}}</td>
                </ng-container>

                <!-- Email Column -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                  <td mat-cell *matCellDef="let user">{{user.email}}</td>
                </ng-container>

                <!-- Role Column -->
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
                  <td mat-cell *matCellDef="let user">
                    <span class="role-badge" [ngClass]="user.role">{{user.role | titlecase}}</span>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let user">
                    <span class="status-badge" [ngClass]="user.status">{{user.status | titlecase}}</span>
                  </td>
                </ng-container>

                <!-- Last Login Column -->
                <ng-container matColumnDef="lastLogin">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Login</th>
                  <td mat-cell *matCellDef="let user">{{user.lastLogin ? (user.lastLogin | date:'short') : 'Never'}}</td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="actions-cell">
                      <button mat-icon-button color="primary" aria-label="Edit" (click)="openEditDialog(user)" class="action-btn edit">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="accent" aria-label="Toggle status" (click)="toggleUserStatus(user)" class="action-btn toggle">
                        <mat-icon>{{user.status === 'active' ? 'block' : 'check_circle'}}</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" aria-label="Delete" (click)="deleteUser(user)" class="action-btn delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns" class="header-row"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="data-row"></tr>
              </table>
            </div>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of users"></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    /* Strong overrides for paginator & selects (legacy + MDC classes) */
    ::ng-deep .mat-paginator, ::ng-deep .mat-mdc-paginator,
    ::ng-deep .mat-paginator .mat-paginator-range-label, ::ng-deep .mat-mdc-paginator .mat-paginator-range-label,
    ::ng-deep .mat-paginator .mat-paginator-page-size-label, ::ng-deep .mat-mdc-paginator .mat-paginator-page-size-label,
    ::ng-deep .mat-paginator .mat-select-value-text, ::ng-deep .mat-mdc-paginator .mat-select-value-text,
    ::ng-deep .mat-paginator .mat-select-value, ::ng-deep .mat-mdc-paginator .mat-select-value,
    ::ng-deep .mat-paginator .mat-paginator-page-size .mat-select-value-text, ::ng-deep .mat-mdc-paginator .mat-paginator-page-size .mat-select-value-text {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial !important;
      font-weight: 800 !important;
      font-size: 0.95rem !important;
      color: #111827 !important;
    }

    /* Also force font inside the select overlay panel (options list) */
    ::ng-deep .mat-select-panel, ::ng-deep .mat-mdc-select-panel,
    ::ng-deep .mat-select-panel .mat-option-text, ::ng-deep .mat-mdc-select-panel .mat-mdc-option,
    ::ng-deep .mat-select-panel .mat-option, ::ng-deep .mat-mdc-select-panel .mat-mdc-option .mat-mdc-option-label {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial !important;
      font-weight: 800 !important;
      font-size: 0.95rem !important;
      color: #111827 !important;
    }

    /* make paginator select width comfortable */
    ::ng-deep .mat-paginator .mat-select-trigger, ::ng-deep .mat-mdc-paginator .mat-select-trigger { min-width: 56px !important; }

    /* Revert search field visuals to simpler earlier style */
    .search-field { width: 320px; min-width: 160px; background: transparent; border-radius: 8px; box-shadow: none; padding: 0; }
    .search-field .mat-form-field-wrapper { padding: 0 !important; }
    .search-field .mat-form-field-infix { padding: 0 !important; overflow: visible; }

    /* Input text uses header Inter and placeholder smaller (configured below) */
    .search-field .mat-input-element {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial !important;
      font-weight: 600 !important;
      font-size: 1rem !important; /* typed text */
      color: #111827 !important;
      padding: 4px 6px !important;
    }

    /* Placeholder size and styling — change font-size here to adjust placeholder size */
    .search-field input::placeholder,
    ::ng-deep .search-field .mat-input-element::placeholder {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial !important;
      font-weight: 600 !important;
      font-size: 0.60rem !important; /* <- adjust this value to change placeholder size */
      color: #9ca3af !important;
      opacity: 1 !important;
    }

    /* Global user management styles (kept) */
    .user-management {
      padding: 28px;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color: #111827;
    }

    .um-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    /* Title uses header Inter */
    .um-title h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }

    .um-sub {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 4px;
    }

    .um-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-field { width: 320px; min-width: 160px; }

    .um-stats {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat .num {
      font-weight: 700;
      font-size: 1.1rem;
      text-align: center;
    }

    .stat .label {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
    }

    /* Improved Add User button */
    .add-button {
      border-radius: 10px;
      padding: 10px 16px;
      min-width: 140px;
      box-shadow: 0 8px 28px rgba(2,6,23,0.08);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
      font-weight: 700;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }

    .add-button mat-icon { font-size: 20px; }

    .user-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(17,24,39,0.04);
    }

    .table-wrap {
      overflow: auto;
      border-radius: 8px;
    }

    /* Table uses header Inter font */
    .user-table,
    .user-table th,
    .user-table td {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      font-weight: 700;
    }

    .user-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 820px;
      background: white;
    }

    .user-table th, .user-table td {
      padding: 14px 20px;
      text-align: left;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
      font-size: 0.95rem;
      overflow: visible;
      white-space: nowrap;
    }

    /* Make header sticky and visually distinct */
    .user-table .header-row th {
      background: linear-gradient(180deg, #ffffff, #fbfbfb);
      position: sticky;
      top: 0;
      z-index: 2;
      box-shadow: inset 0 -1px 0 #eef2ff;
      font-weight: 800;
      color: #374151;
    }

    .user-table .data-row:nth-child(even) {
      background: #fbfbfc;
    }

    .user-table .data-row:hover {
      background: #f8fafc;
    }

    /* Role & status badges retain smaller weight */
    .role-badge, .status-badge {
      font-weight: 600;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }

    .role-badge { display: inline-flex; padding: 6px 10px; border-radius: 999px; font-size: 0.8rem; color: #065f46; background: #ecfdf5; }
    .role-badge.admin { background: #f0f9ff; color: #075985; }
    .role-badge.user { background: #fff7ed; color: #92400e; }
    .role-badge.visitor { background: #f0f9ff; color: #075985; }

    .status-badge { display: inline-flex; padding: 6px 10px; border-radius: 999px; font-size: 0.8rem; }
    .status-badge.active { background: #ecfdf5; color: #065f46; }
    .status-badge.inactive { background: #fff7f2; color: #7f1d1d; }

    /* Ensure action buttons are visible and not cut off */
    .mat-column-actions { width: 200px; max-width: 200px; text-align: center; }
    .actions-cell { display: flex; gap: 8px; justify-content: center; align-items: center; overflow: visible; }
    .action-btn { border-radius: 8px; width: 44px; height: 44px; min-width: 44px; min-height: 44px; }
    .action-btn mat-icon { font-size: 20px; }

    /* Responsive tweaks */
    @media (max-width: 900px) {
      .search-field { width: 240px; }
      .user-table { min-width: 640px; }
    }

    @media (max-width: 640px) {
      .um-toolbar { flex-direction: column; align-items: stretch; gap: 12px; }
      .um-actions { justify-content: space-between; }
      .search-field { width: 100%; }
      .user-table { min-width: 540px; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  dataSource = new MatTableDataSource<User>();
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'lastLogin', 'actions'];
  searchValue: string = '';

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private notifier: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value || '';
    this.searchValue = val;
    this.applyFilterInternal(val);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.applyFilterInternal('');
  }

  private applyFilterInternal(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        // Ensure table detects the change (MatTableDataSource sometimes needs this)
        try { this.dataSource._updateChangeSubscription(); } catch (e) { /* ignore */ }
        if (!this.dataSource.paginator && this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        this.notifier.errorKey('notifications.user_create_error', { error: error.message || '' });
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { name: '', email: '', role: 'visitor' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addUser(result);
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { ...user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser(result);
      }
    });
  }

  addUser(data: UserFormData): void {
    const createData: CreateUserData = {
      name: data.name,
      email: data.email,
      password: 'default123', // In real app, generate or ask for password
      role: data.role
    };

    this.authService.createUser(createData).subscribe({
      next: (newUser) => {
        this.notifier.successKey('notifications.user_created');
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.notifier.errorKey('notifications.user_create_error', { error: error.message || '' });
      }
    });
  }

  updateUser(data: UserFormData): void {
    const updateData: UpdateUserData = {
      id: data.id!,
      name: data.name,
      email: data.email,
      role: data.role
    };

    this.authService.updateUser(updateData).subscribe({
      next: (updatedUser) => {
        this.notifier.successKey('notifications.user_updated');
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.notifier.errorKey('notifications.user_update_error', { error: error.message || '' });
      }
    });
  }

  async deleteUser(user: User): Promise<void> {
    const confirmation = await this.notifier.confirmKey('notifications.confirm_delete_user', { title: user.name });
    if (confirmation.isConfirmed) {
      this.authService.deleteUser(user.id).subscribe({
        next: (success) => {
          if (success) {
            this.notifier.successKey('notifications.user_deleted');
            this.loadUsers(); // Reload the list
          }
        },
        error: (error) => {
          this.notifier.errorKey('notifications.user_delete_error', { error: error.message || '' });
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.authService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        this.notifier.toastKey('notifications.user_status_changed', 'success', { status: updatedUser.status === 'active' ? 'activated' : 'deactivated' }, 3000);
        // Optimistically update the table row so UI reflects change immediately
        try {
          const current = this.dataSource.data || [];
          this.dataSource.data = current.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
          try { this.dataSource._updateChangeSubscription(); } catch (e) { /* ignore */ }
        } catch (e) {
          // fallback to full reload
          this.loadUsers();
        }
      },
      error: (error) => {
        this.notifier.errorKey('notifications.user_status_error', { error: error.message || '' });
      }
    });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'operator': return 'accent';
      case 'visitor': return 'primary';
      default: return 'primary';
    }
  }
}