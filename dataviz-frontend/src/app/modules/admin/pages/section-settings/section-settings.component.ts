import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SectionFormDialogComponent, SectionFormData } from '../../components/section-form-dialog/section-form-dialog.component';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { DashboardService, Section, CreateSectionData, UpdateSectionData } from '../../../../shared/services/dashboard.service';

interface SectionDisplay {
  id: string;
  title: string;
  background: string;
  visible: boolean;
  widgetCount: number;
}

@Component({
  selector: 'app-section-settings',
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
    MatSlideToggleModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout>
      <div class="section-settings">
        <div class="header">
          <h1>Section Settings</h1>
          <button mat-raised-button color="primary" (click)="openAddDialog()">
            <mat-icon>add</mat-icon>
            Add Section
          </button>
        </div>

        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
                <td mat-cell *matCellDef="let section">{{section.title}}</td>
              </ng-container>

              <!-- Background Column -->
              <ng-container matColumnDef="background">
                <th mat-header-cell *matHeaderCellDef>Background</th>
                <td mat-cell *matCellDef="let section">
                  <div class="color-preview" [style.background-color]="section.background"></div>
                  {{section.background}}
                </td>
              </ng-container>

              <!-- Widget Count Column -->
              <ng-container matColumnDef="widgetCount">
                <th mat-header-cell *matHeaderCellDef>Widgets</th>
                <td mat-cell *matCellDef="let section">{{section.widgetCount}}</td>
              </ng-container>

              <!-- Visible Column -->
              <ng-container matColumnDef="visible">
                <th mat-header-cell *matHeaderCellDef>Visible</th>
                <td mat-cell *matCellDef="let section">
                  <mat-slide-toggle
                    [checked]="section.visible"
                    (change)="toggleVisibility(section)"
                    matTooltip="Toggle section visibility">
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let section">
                  <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openEditDialog(section)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="deleteSection(section)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of sections"></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .section-settings {
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

    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #ddd;
      display: inline-block;
      margin-right: 8px;
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

    .mat-column-visible {
      width: 100px;
      text-align: center;
    }

    .mat-column-widgetCount {
      width: 80px;
      text-align: center;
    }
  `]
})
export class SectionSettingsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  dataSource = new MatTableDataSource<SectionDisplay>();
  displayedColumns: string[] = ['title', 'background', 'widgetCount', 'visible', 'actions'];

  constructor(
    private dialog: MatDialog,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSections();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadSections(): void {
    this.dashboardService.getAllSections().subscribe({
      next: (sections) => {
        const displaySections: SectionDisplay[] = sections.map(section => ({
          id: section.id,
          title: section.title,
          background: section.background,
          visible: section.visible,
          widgetCount: section.widgets.length
        }));
        this.dataSource.data = displaySections;
      },
      error: (error) => {
        this.snackBar.open('Error loading sections: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: '500px',
      data: { title: '', background: '#ffffff' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addSection(result);
      }
    });
  }

  openEditDialog(section: SectionDisplay): void {
    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: '500px',
      data: { ...section }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSection(result);
      }
    });
  }

  addSection(data: SectionFormData): void {
    const createData: CreateSectionData = {
      title: data.title,
      background: data.background
    };

    this.dashboardService.createSection(createData).subscribe({
      next: (newSection) => {
        this.snackBar.open('Section created successfully', 'Close', { duration: 3000 });
        this.loadSections(); // Reload the list
      },
      error: (error) => {
        this.snackBar.open('Error creating section: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }

  updateSection(data: SectionFormData): void {
    const updateData: UpdateSectionData = {
      id: data.id!,
      title: data.title,
      background: data.background
    };

    this.dashboardService.updateSection(updateData).subscribe({
      next: (updatedSection) => {
        this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
        this.loadSections(); // Reload the list
      },
      error: (error) => {
        this.snackBar.open('Error updating section: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }

  deleteSection(section: SectionDisplay): void {
    if (confirm(`Are you sure you want to delete section "${section.title}"?`)) {
      this.dashboardService.deleteSection(section.id).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Section deleted successfully', 'Close', { duration: 3000 });
            this.loadSections(); // Reload the list
          }
        },
        error: (error) => {
          this.snackBar.open('Error deleting section: ' + error.message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleVisibility(section: SectionDisplay): void {
    this.dashboardService.toggleSectionVisibility(section.id).subscribe({
      next: (updatedSection) => {
        this.snackBar.open(`Section ${updatedSection.visible ? 'shown' : 'hidden'} successfully`, 'Close', { duration: 3000 });
        this.loadSections(); // Reload the list
      },
      error: (error) => {
        this.snackBar.open('Error updating section visibility: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }
} 