import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { WidgetFormDialogComponent } from '../../components/widget-form-dialog/widget-form-dialog.component';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';

export interface WidgetConfig {
  id: string;
  title: string;
  dataSource: string;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'map';
  section: string;
  createdAt: Date;
}

@Component({
  selector: 'app-widget-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout>
      <div class="widget-settings">
        <div class="header">
          <h1>Widget Settings</h1>
          <button mat-raised-button color="primary" (click)="openWidgetDialog()">
            <mat-icon>add</mat-icon>
            Add Widget
          </button>
        </div>

        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Title </th>
                <td mat-cell *matCellDef="let widget"> {{widget.title}} </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Type </th>
                <td mat-cell *matCellDef="let widget">
                  <span class="type-badge" [class]="'type-' + widget.type">
                    {{widget.type}}
                  </span>
                </td>
              </ng-container>

              <!-- Data Source Column -->
              <ng-container matColumnDef="dataSource">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Data Source </th>
                <td mat-cell *matCellDef="let widget"> {{widget.dataSource}} </td>
              </ng-container>

              <!-- Size Column -->
              <ng-container matColumnDef="size">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Size </th>
                <td mat-cell *matCellDef="let widget">
                  <span class="size-badge" [class]="'size-' + widget.size">
                    {{widget.size}}
                  </span>
                </td>
              </ng-container>

              <!-- Section Column -->
              <ng-container matColumnDef="section">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Section </th>
                <td mat-cell *matCellDef="let widget"> {{widget.section}} </td>
              </ng-container>

              <!-- Visibility Column -->
              <ng-container matColumnDef="visible">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Visibility </th>
                <td mat-cell *matCellDef="let widget">
                  <mat-slide-toggle 
                    [checked]="widget.visible" 
                    (change)="toggleVisibility(widget)"
                    color="primary">
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let widget">
                  <button mat-icon-button color="primary" (click)="editWidget(widget)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteWidget(widget)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of widgets"></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .widget-settings {
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

    mat-card {
      margin-bottom: 24px;
    }

    table {
      width: 100%;
    }

    .type-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .type-metric {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .type-pie {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .type-bar {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .type-line {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .type-column {
      background-color: #e0f2f1;
      color: #00695c;
    }

    .type-sankey {
      background-color: #fff8e1;
      color: #f57f17;
    }

    .type-table {
      background-color: #fce4ec;
      color: #c2185b;
    }

    .type-text {
      background-color: #f1f8e9;
      color: #558b2f;
    }

    .type-map {
      background-color: #e8eaf6;
      color: #3949ab;
    }

    .size-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .size-small {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .size-medium {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .size-large {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .mat-column-visible {
      width: 100px;
      text-align: center;
    }

    .mat-column-size {
      width: 80px;
      text-align: center;
    }

    .mat-column-type {
      width: 100px;
      text-align: center;
    }
  `]
})
export class WidgetSettingsComponent implements OnInit {
  displayedColumns: string[] = ['title', 'type', 'dataSource', 'size', 'section', 'visible', 'actions'];
  dataSource: MatTableDataSource<WidgetConfig>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dummyWidgets: WidgetConfig[] = [
    {
      id: '1',
      title: 'Total Visitors',
      dataSource: 'analytics_api',
      size: 'small',
      visible: true,
      type: 'metric',
      section: 'Overview',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Traffic Sources',
      dataSource: 'traffic_api',
      size: 'medium',
      visible: true,
      type: 'pie',
      section: 'Analytics',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '3',
      title: 'Monthly Growth',
      dataSource: 'growth_api',
      size: 'large',
      visible: true,
      type: 'line',
      section: 'Performance',
      createdAt: new Date('2024-02-20')
    },
    {
      id: '4',
      title: 'Regional Data',
      dataSource: 'geo_api',
      size: 'medium',
      visible: false,
      type: 'map',
      section: 'Global',
      createdAt: new Date('2024-02-20')
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.dummyWidgets);
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openWidgetDialog(widget?: WidgetConfig) {
    const dialogRef = this.dialog.open(WidgetFormDialogComponent, {
      width: '500px',
      data: widget || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (widget) {
          this.editWidgetInList(widget, result);
        } else {
          this.addWidgetToList(result);
        }
      }
    });
  }

  editWidget(widget: WidgetConfig) {
    this.openWidgetDialog(widget);
  }

  deleteWidget(widget: WidgetConfig) {
    if (confirm(`Are you sure you want to delete "${widget.title}"?`)) {
      this.dummyWidgets = this.dummyWidgets.filter(w => w.id !== widget.id);
      this.dataSource.data = this.dummyWidgets;
      this.snackBar.open('Widget deleted successfully', 'Close', { duration: 3000 });
    }
  }

  toggleVisibility(widget: WidgetConfig) {
    widget.visible = !widget.visible;
    this.dataSource.data = this.dummyWidgets;
    this.snackBar.open(`Widget ${widget.visible ? 'shown' : 'hidden'} successfully`, 'Close', { duration: 2000 });
  }

  private addWidgetToList(widgetData: any) {
    const newWidget: WidgetConfig = {
      id: Date.now().toString(),
      title: widgetData.title,
      dataSource: widgetData.dataSource,
      size: widgetData.size,
      type: widgetData.type,
      section: widgetData.section,
      visible: true,
      createdAt: new Date()
    };
    
    this.dummyWidgets.push(newWidget);
    this.dataSource.data = this.dummyWidgets;
    this.snackBar.open('Widget added successfully', 'Close', { duration: 3000 });
  }

  private editWidgetInList(originalWidget: WidgetConfig, updatedData: any) {
    const index = this.dummyWidgets.findIndex(w => w.id === originalWidget.id);
    if (index !== -1) {
      this.dummyWidgets[index] = {
        ...originalWidget,
        title: updatedData.title,
        dataSource: updatedData.dataSource,
        size: updatedData.size,
        type: updatedData.type,
        section: updatedData.section
      };
      this.dataSource.data = this.dummyWidgets;
      this.snackBar.open('Widget updated successfully', 'Close', { duration: 3000 });
    }
  }
} 