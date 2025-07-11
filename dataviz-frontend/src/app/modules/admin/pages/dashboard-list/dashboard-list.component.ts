import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { DashboardService, DashboardListItem } from '../../../../shared/services/dashboard.service';

@Component({
  selector: 'app-dashboard-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout>
      <div class="dashboard-list">
        <div class="header">
          <h1>Dashboard Builder</h1>
          <button mat-raised-button color="primary" (click)="createNewDashboard()">
            <mat-icon>add</mat-icon>
            Create Dashboard
          </button>
        </div>

        <div class="dashboards-grid">
          <mat-card 
            *ngFor="let dashboard of dashboards" 
            class="dashboard-card"
            (click)="openDashboard(dashboard)">
            <mat-card-header>
              <mat-card-title>{{ dashboard.title }}</mat-card-title>
              <mat-card-subtitle>{{ dashboard.name }}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="dashboard-info">
                <p class="source">
                  <mat-icon>data_source</mat-icon>
                  {{ dashboard.source }}
                </p>
                <div class="dates">
                  <span class="date">
                    <strong>Created:</strong> {{ dashboard.createdDate | date:'short' }}
                  </span>
                  <span class="date">
                    <strong>Modified:</strong> {{ dashboard.lastModified | date:'short' }}
                  </span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="openDashboard(dashboard)">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-button color="warn" (click)="deleteDashboard(dashboard, $event)">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .dashboard-list {
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

    .dashboards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .dashboard-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #e0e0e0;
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .dashboard-info {
      margin-top: 16px;
    }

    .source {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
      margin: 8px 0;
    }

    .source mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .dates {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 12px;
    }

    .date {
      font-size: 12px;
      color: #888;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: space-between;
    }

    @media (max-width: 768px) {
      .dashboards-grid {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class DashboardListComponent implements OnInit {
  dashboards: DashboardListItem[] = [];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboards();
  }

  loadDashboards(): void {
    this.dashboardService.getDashboardList().subscribe({
      next: (dashboards) => {
        this.dashboards = dashboards;
      },
      error: (error) => {
        console.error('Error loading dashboards:', error);
      }
    });
  }

  openDashboard(dashboard: DashboardListItem): void {
    this.router.navigate(['/admin/dashboard-builder', dashboard.id]);
  }

  createNewDashboard(): void {
    // For now, just navigate to the first dashboard
    this.router.navigate(['/admin/dashboard-builder', '1']);
  }

  deleteDashboard(dashboard: DashboardListItem, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${dashboard.title}"?`)) {
      // For mockup, just remove from local array
      this.dashboards = this.dashboards.filter(d => d.id !== dashboard.id);
    }
  }
} 