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
    MatChipsModule,
    MatSnackBarModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout>
      <div class="user-management">
        <div class="header">
          <h1>User Management</h1>
          <button mat-raised-button color="primary" (click)="openAddDialog()">
            <mat-icon>person_add</mat-icon>
            Add User
          </button>
        </div>

        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="dataSource" matSort>
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
                  <mat-chip [color]="getRoleColor(user.role)" selected>
                    {{user.role | titlecase}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="user.status === 'active' ? 'primary' : 'warn'" selected>
                    {{user.status | titlecase}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Last Login Column -->
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Login</th>
                <td mat-cell *matCellDef="let user">
                  {{user.lastLogin ? (user.lastLogin | date:'short') : 'Never'}}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openEditDialog(user)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="toggleUserStatus(user)">
                      <mat-icon>{{user.status === 'active' ? 'block' : 'check_circle'}}</mat-icon>
                      {{user.status === 'active' ? 'Deactivate' : 'Activate'}}
                    </button>
                    <button mat-menu-item (click)="deleteUser(user)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of users"></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .user-management {
      padding: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .delete-action {
      color: #f44336;
    }

    mat-card {
      margin-bottom: 24px;
    }

    table {
      width: 100%;
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }

    .mat-column-status {
      width: 100px;
      text-align: center;
    }

    .mat-column-role {
      width: 120px;
      text-align: center;
    }

    .mat-column-lastLogin {
      width: 150px;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  dataSource = new MatTableDataSource<User>();
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'lastLogin', 'actions'];

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
      },
      error: (error) => {
        this.snackBar.open('Error loading users: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
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
      width: '500px',
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
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.snackBar.open('Error creating user: ' + error.message, 'Close', { duration: 3000 });
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
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.snackBar.open('Error updating user: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      this.authService.deleteUser(user.id).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
            this.loadUsers(); // Reload the list
          }
        },
        error: (error) => {
          this.snackBar.open('Error deleting user: ' + error.message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.authService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        this.snackBar.open(`User ${updatedUser.status === 'active' ? 'activated' : 'deactivated'} successfully`, 'Close', { duration: 3000 });
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.snackBar.open('Error updating user status: ' + error.message, 'Close', { duration: 3000 });
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