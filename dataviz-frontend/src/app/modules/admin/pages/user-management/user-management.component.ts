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
import { UserFormDialogComponent, UserFormData } from '../../components/user-form-dialog/user-form-dialog.component';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'operator' | 'visitor';
  lastLogin?: Date;
  status: 'active' | 'inactive';
}

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

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    // Mock data - replace with actual API call
    const users: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'operator', status: 'active', lastLogin: new Date() },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'visitor', status: 'active', lastLogin: new Date(Date.now() - 86400000) },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'visitor', status: 'inactive' },
      { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 172800000) }
    ];
    this.dataSource.data = users;
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
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'active'
    };
    
    this.dataSource.data = [...this.dataSource.data, newUser];
  }

  updateUser(data: UserFormData): void {
    const index = this.dataSource.data.findIndex(u => u.id === data.id);
    if (index !== -1) {
      this.dataSource.data[index] = { ...this.dataSource.data[index], ...data };
      this.dataSource.data = [...this.dataSource.data];
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);
    }
  }

  toggleUserStatus(user: User): void {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    this.dataSource.data = [...this.dataSource.data];
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'operator': return 'accent';
      case 'visitor': return 'primary';
      default: return 'primary';
    }
  }
} 