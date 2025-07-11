import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { DashboardService, DashboardData, Section, Widget } from '../../../../shared/services/dashboard.service';
import { WidgetConfigDialogComponent } from '../../components/widget-config-dialog/widget-config-dialog.component';
import { SectionFormDialogComponent } from '../../components/section-form-dialog/section-form-dialog.component';
import { ThemeSelectorDialogComponent, ThemeOption } from '../../components/theme-selector-dialog/theme-selector-dialog.component';

@Component({
  selector: 'app-dashboard-builder',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout>
      <div class="dashboard-builder">
        <div class="header">
          <div class="header-left">
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back to Dashboards
            </button>
            <h1>{{ dashboard?.title || 'Dashboard Builder' }}</h1>
          </div>
          <div class="header-actions">
            <button mat-button (click)="openThemeSelector()" matTooltip="Dashboard Settings">
              <mat-icon>settings</mat-icon>
              Settings
            </button>
            <button mat-button (click)="addSection()" matTooltip="Add Section">
              <mat-icon>add</mat-icon>
              Add Section
            </button>
            <button mat-raised-button color="primary" (click)="saveDashboard()">
              <mat-icon>save</mat-icon>
              Save Dashboard
            </button>
          </div>
        </div>

        <div class="builder-content">
          <!-- Section Tabs -->
          <mat-tab-group 
            [(selectedIndex)]="selectedTabIndex"
            (selectedIndexChange)="onTabChange($event)"
            class="section-tabs">
            <mat-tab 
              *ngFor="let section of dashboard?.sections; let i = index"
              [label]="section.title"
              [disabled]="!section.visible">
              
              <!-- Section Header with Actions -->
              <div class="section-header">
                <div class="section-info">
                  <h3>{{ section.title }}</h3>
                  <span class="widget-count">{{ section.widgets.length }} widgets</span>
                </div>
                <div class="section-actions">
                  <button mat-icon-button (click)="editSection(section)" matTooltip="Edit Section">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteSection(section)" matTooltip="Delete Section">
                    <mat-icon>delete</mat-icon>
                  </button>
                  <button mat-icon-button (click)="addWidget(section)" matTooltip="Add Widget">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Widget Grid -->
              <div class="widget-grid" 
                   cdkDropList
                   [cdkDropListData]="section.widgets"
                   (cdkDropListDropped)="onWidgetDrop($event, i)">
                
                <div class="widget-card"
                     *ngFor="let widget of section.widgets"
                     cdkDrag
                     [class.widget-small]="widget.size === 'small'"
                     [class.widget-medium]="widget.size === 'medium'"
                     [class.widget-large]="widget.size === 'large'">
                  
                  <div class="widget-header">
                    <h3>{{ widget.title }}</h3>
                    <div class="widget-actions">
                      <button mat-icon-button 
                              matTooltip="Edit Widget"
                              (click)="editWidget(widget)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button 
                              matTooltip="Delete Widget"
                              (click)="deleteWidget(widget)">
                        <mat-icon>delete</mat-icon>
                      </button>
                      <button mat-icon-button 
                              cdkDragHandle
                              matTooltip="Move Widget">
                        <mat-icon>drag_indicator</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <div class="widget-content">
                    <div class="widget-preview">
                      <mat-icon>{{ getWidgetIcon(widget.type) }}</mat-icon>
                      <span>{{ widget.type | titlecase }} Widget</span>
                    </div>
                    <div class="widget-info">
                      <span class="widget-size">{{ widget.size | titlecase }}</span>
                      <span class="widget-source">{{ widget.dataSource }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .dashboard-builder {
      padding: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
      background: white;
      z-index: 10;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-left h1 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .builder-content {
      flex: 1;
      overflow: hidden;
    }

    .section-tabs {
      height: 100%;
    }

    .section-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      height: calc(100% - 48px);
      overflow: auto;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .section-info h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .widget-count {
      font-size: 12px;
      color: #666;
    }

    .section-actions {
      display: flex;
      gap: 8px;
    }

    .widget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      padding: 24px;
      min-height: 400px;
    }

    .widget-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s ease;
      cursor: move;
    }

    .widget-card:hover {
      border-color: #2196F3;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
    }

    .widget-card.cdk-drag-preview {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: #2196F3;
    }

    .widget-card.cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed #ccc;
    }

    .widget-card.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .widget-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .widget-actions {
      display: flex;
      gap: 4px;
    }

    .widget-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .widget-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px;
      background: #f5f5f5;
      border-radius: 6px;
      color: #666;
    }

    .widget-preview mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .widget-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #888;
    }

    .widget-small {
      grid-column: span 1;
      grid-row: span 1;
    }

    .widget-medium {
      grid-column: span 2;
      grid-row: span 2;
    }

    .widget-large {
      grid-column: span 3;
      grid-row: span 3;
    }

    @media (max-width: 768px) {
      .widget-grid {
        grid-template-columns: 1fr;
      }
      
      .widget-medium,
      .widget-large {
        grid-column: span 1;
        grid-row: span 1;
      }
    }
  `]
})
export class DashboardBuilderComponent implements OnInit, OnDestroy {
  dashboard?: DashboardData;
  selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const dashboardId = this.route.snapshot.paramMap.get('id');
    if (dashboardId) {
      this.loadDashboard(dashboardId);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadDashboard(id: string): void {
    this.dashboardService.getDashboardById(id).subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.snackBar.open('Error loading dashboard', 'Close', { duration: 3000 });
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  onWidgetDrop(event: CdkDragDrop<Widget[]>, sectionIndex: number): void {
    if (event.previousContainer === event.container) {
      // Move within same section
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between sections
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update widget section
      const widget = event.container.data[event.currentIndex];
      if (widget && this.dashboard) {
        widget.section = this.dashboard.sections[sectionIndex].title;
      }
    }
  }

  editWidget(widget: Widget): void {
    const dialogRef = this.dialog.open(WidgetConfigDialogComponent, {
      width: '500px',
      data: {
        title: widget.title,
        type: widget.type,
        size: widget.size
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dashboardService.updateWidgetConfig(widget.id, result).subscribe({
          next: (updatedWidget) => {
            this.snackBar.open('Widget updated successfully', 'Close', { duration: 3000 });
            this.loadDashboard(this.route.snapshot.paramMap.get('id') || '1');
          },
          error: (error) => {
            this.snackBar.open('Error updating widget', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteWidget(widget: Widget): void {
    if (confirm(`Are you sure you want to delete "${widget.title}"?`)) {
      this.dashboardService.deleteWidget(widget.id).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Widget deleted successfully', 'Close', { duration: 3000 });
            this.loadDashboard(this.route.snapshot.paramMap.get('id') || '1');
          }
        },
        error: (error) => {
          this.snackBar.open('Error deleting widget', 'Close', { duration: 3000 });
        }
      });
    }
  }

  saveDashboard(): void {
    this.snackBar.open('Dashboard saved successfully', 'Close', { duration: 3000 });
  }

  addSection(): void {
    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: '400px',
      data: {
        title: 'New Section',
        background: '#f5f5f5',
        visible: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.dashboard) {
        const newSection = {
          id: Date.now().toString(),
          title: result.title,
          background: result.background,
          visible: result.visible,
          widgets: []
        };
        this.dashboard.sections.push(newSection);
        this.snackBar.open('Section added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  editSection(section: any): void {
    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: '500px',
      data: {
        title: section.title,
        background: section.background
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        section.title = result.title;
        section.background = result.background;
        this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteSection(section: Section): void {
    if (confirm(`Are you sure you want to delete section "${section.title}"? This will also delete all widgets in this section.`)) {
      if (this.dashboard) {
        const index = this.dashboard.sections.findIndex(s => s.id === section.id);
        if (index !== -1) {
          this.dashboard.sections.splice(index, 1);
          this.snackBar.open('Section deleted successfully', 'Close', { duration: 3000 });
        }
      }
    }
  }

  addWidget(section: any): void {
    const dialogRef = this.dialog.open(WidgetConfigDialogComponent, {
      width: '500px',
      data: {
        title: 'New Widget',
        type: 'metric',
        size: 'small'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.dashboard) {
        const totalSize = result.rows * result.columns;
        const size: 'small' | 'medium' | 'large' = 
          totalSize <= 1 ? 'small' : 
          totalSize <= 4 ? 'medium' : 'large';

        const newWidget: Widget = {
          id: Date.now().toString(),
          title: result.title,
          type: result.type,
          size: size,
          dataSource: 'default-data',
          visible: true,
          section: section.title,
          lastUpdated: new Date()
        };
        
        section.widgets.push(newWidget);
        this.snackBar.open('Widget added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard-list']);
  }

  getWidgetIcon(type: string): string {
    const icons: { [key: string]: string } = {
      metric: 'analytics',
      pie: 'pie_chart',
      bar: 'bar_chart',
      line: 'show_chart',
      column: 'stacked_bar_chart',
      sankey: 'account_tree',
      table: 'table_chart',
      text: 'text_fields',
      map: 'map'
    };
    return icons[type] || 'widgets';
  }

  openThemeSelector(): void {
    // Get available themes and current theme
    this.dashboardService.getAvailableThemes().subscribe(themes => {
      this.dashboardService.getCurrentTheme().subscribe(currentTheme => {
        const dialogRef = this.dialog.open(ThemeSelectorDialogComponent, {
          width: '600px',
          data: {
            currentTheme: currentTheme,
            availableThemes: themes
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result && result !== currentTheme) {
            this.dashboardService.updateTheme(result).subscribe({
              next: (newTheme) => {
                if (this.dashboard) {
                  this.dashboard.theme = newTheme;
                }
                this.snackBar.open(`Theme changed to ${newTheme}`, 'Close', { duration: 3000 });
              },
              error: (error) => {
                this.snackBar.open('Error updating theme', 'Close', { duration: 3000 });
              }
            });
          }
        });
      });
    });
  }
} 