import { Component, OnInit, OnDestroy, Injectable } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AdminLayoutComponent } from "../../components/admin-layout/admin-layout.component";
import { DashboardBuilderService } from "../dashboard-builder/dashboard-builder.service";
import { MatDialog } from "@angular/material/dialog";
import { SchoolSelectionDialogComponent, SchoolSelectionResult } from '../../components/school-selection-dialog/school-selection-dialog.component';
import { LoadingSpinnerDialogComponent } from '../../components/loading-spinner-dialog/loading-spinner-dialog.component';
import { DashboardFormDialogComponent, DashboardFormDialogData } from '../../components/dashboard-form-dialog/dashboard-form-dialog.component';
import { ShareDataService } from "app/shared/services/share-data.service";
import Swal from 'sweetalert2';
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';

// Create a specialized service for Job Description dashboards
@Injectable({
  providedIn: 'root'
})
export class JobDescriptionListService extends DashboardBuilderService {
  
  override async getAllDashboards(filter: any = {}) {
    // Always apply the job description filter
    const jobDescriptionFilter = {
      ...filter,
      typeOfUsage: 'JOB_DESCRIPTION_EVALUATION'
    };
    return super.getAllDashboards(jobDescriptionFilter);
  }
}

// UPDATED: Dashboard interface to reflect the new 'sources' array structure
interface Section {
  _id?: string;
  name?: string;
  background?: string;
  title: string;
  widgetIds: any[];
  status?: string;
}

interface Dashboard {
  _id?: string;
  name?: string;
  sectionIds: Section[];
  sources?: { certification: string | null; classes: string[] | null }[]; // Updated source structure
  title: string;
  status?: string;
}

@Component({
  selector: "app-job-description-list",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    AdminLayoutComponent,
    // translation pipe
    TranslatePipe,
  ],
  providers: [
    { provide: DashboardBuilderService, useClass: JobDescriptionListService }
  ],
  templateUrl: "./job-description-list.component.html",
  styleUrl: "./job-description-list.component.scss",
})
export class JobDescriptionListComponent implements OnInit {
  dashboards: Dashboard[] = [];
  // Map to store expansion state for sources per dashboard
  dashboardSourcesExpansionState: Map<string, boolean> = new Map();
  initialVisibleSources = 1; // Number of sources to show initially before collapsing
  isLoading = false;

  constructor(
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private dialog: MatDialog,
    private shareDataService: ShareDataService,
    private notifier: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboards();
  }

  /**
   * Track by function for ngFor to improve performance
   */
  trackByDashboardId(index: number, dashboard: Dashboard): string {
    return dashboard._id || index.toString();
  }

  async loadDashboards() {
    try {
      this.isLoading = true;
      const filter = {};
      const result = await this.dashboardService.getAllDashboards(filter);
      
      if (result?.data) {
        this.dashboards = result?.data;
        
        // Initialize expansion state for new dashboards
        this.dashboards.forEach(dashboard => {
          if (dashboard._id && !this.dashboardSourcesExpansionState.has(dashboard._id)) {
            this.dashboardSourcesExpansionState.set(dashboard._id, false);
          }
        });
      }
    } catch (error) {
      console.error("Error loading dashboards:", error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Scroll to dashboard card by id and focus it.
   */
  scrollToDashboard(dashboardId: string): void {
    try {
      const selector = `[data-dashboard-id=\"${dashboardId}\"]`;
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus for accessibility
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    } catch (err) {
      console.error('Error scrolling to dashboard:', err);
    }
  }

  openDashboard(dashboard: Dashboard, event?: Event): void {
    // Prevent bubbling when called from button click
    if (event) {
      event.stopPropagation();
    }

    const dialogRef = this.dialog.open(SchoolSelectionDialogComponent, {
      width: '600px',
      data: {
        dashboardId: dashboard._id,
        dashboardTitle: dashboard.title || dashboard.name || 'Dashboard'
      },
      panelClass: 'modern-dialog',
      backdropClass: 'modern-backdrop',
      disableClose: false,
      hasBackdrop: true,
      closeOnNavigation: true
    });

    dialogRef.afterClosed().subscribe(async (result: SchoolSelectionResult | undefined) => {
      if (result) {
        // Force close any remaining dialogs
        this.dialog.closeAll();
        
        // Show loading spinner
        const loadingDialogRef = this.dialog.open(LoadingSpinnerDialogComponent, {
          width: '400px',
          disableClose: true,
          hasBackdrop: true,
          backdropClass: 'loading-backdrop',
          panelClass: 'loading-dialog',
          data: {
            message: result.openWithAllData 
              ? 'Opening dashboard...' 
              : `Applying school filters: ${result.selectedSchools.join(', ')}...`
          }
        });
        
        try {
          // Always use school filter query, but pass all schools for "all data" option
          const schoolsToFilter = result.openWithAllData 
            ? ['IEF2I', 'KOUT QUE KOUT MONTPELLIER'] // All available schools
            : result.selectedSchools;
          
          const filterResult = await this.dashboardService.openDashboardWithSchoolFilter(
            dashboard._id || '',
            schoolsToFilter
          );
          
          loadingDialogRef.close();
          
          if (filterResult?._id) {
            this.shareDataService.setDashboardId(filterResult._id);
            this.router.navigate(['/dashboard']);
            
            // Show success message
            const message = result.openWithAllData
              ? 'Dashboard opened with all school data'
              : `Dashboard opened with school filter: ${result.selectedSchools.join(', ')}`;
            
            await this.notifier.success(message, 'Dashboard Opened');
          } else {
            await this.notifier.error('Failed to open dashboard with school filter', 'Error');
          }
        } catch (error) {
          loadingDialogRef.close();
          console.error('Error opening dashboard:', error);
          await this.notifier.error('Failed to open dashboard. Please try again.', 'Error');
        }
      }
    });
  }

  manageDashboard(dashboard: Dashboard, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const cardEl = document.querySelector(`[data-dashboard-id="${dashboard._id}"]`) as HTMLElement | null;
    if (cardEl) {
      cardEl.style.transform = 'scale(0.95)';
      cardEl.style.transition = 'transform 0.1s ease';
      setTimeout(() => {
        this.router.navigate(["/admin/dashboard-builder", dashboard._id]);
      }, 100);
      return;
    }

    this.router.navigate(["/admin/dashboard-builder", dashboard._id]);
  }

  createNewDashboard(): void {
    const dialogRef = this.dialog.open<
      DashboardFormDialogComponent,
      DashboardFormDialogData,
      any
    >(DashboardFormDialogComponent, {
      width: "600px",
      data: {
        typeOfUsage: 'JOB_DESCRIPTION_EVALUATION'
      },
      panelClass: 'modern-dialog',
      backdropClass: 'modern-backdrop',
    });

    dialogRef.afterClosed().subscribe((result) => {
      // If dialog returned a dashboard id (string), reload and scroll to it
      if (typeof result === 'string' && result.length > 0) {
        this.loadDashboards().then(() => {
          // Wait a tick for DOM to update
          setTimeout(() => this.scrollToDashboard(result), 150);
        });
      } else if (result === true) {
        this.loadDashboards();
      }
    });
  }

  editDashboard(dashboard: Dashboard, event: Event): void {
    event.stopPropagation();

    // Add visual feedback
    const button = event.target as HTMLElement;
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);

    const dialogRef = this.dialog.open<
      DashboardFormDialogComponent,
      DashboardFormDialogData,
      boolean
    >(DashboardFormDialogComponent, {
      width: "600px",
      data: {
        dashboard: dashboard,
      },
      panelClass: 'modern-dialog',
      backdropClass: 'modern-backdrop',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Reload when dialog returns truthy (true or updated id string)
      if (result === true || (typeof result === 'string' && (result as string).length > 0)) {
        this.loadDashboards();
      }
    });
  }

  async deleteDashboard(dashboard: Dashboard, event: Event) {
    event.stopPropagation();

    const confirmation = await this.notifier.confirmKey('notifications.confirm_delete_dashboard', { title: dashboard.title }, { showCancelButton: true, confirmButtonColor: '#d33' });

    if (confirmation.isConfirmed) {
      try {
        this.isLoading = true;
        const result = await this.dashboardService.deleteDashboard(dashboard._id);

        if (result) {
          // Remove from local array with smooth animation
          this.dashboards = this.dashboards.filter(d => d._id !== dashboard._id);

          // Clean up expansion state
          if (dashboard._id) {
            this.dashboardSourcesExpansionState.delete(dashboard._id);
          }

          await this.notifier.successKey('notifications.dashboard_deleted', { title: dashboard.title });

          // Refresh the list to ensure consistency
          setTimeout(() => {
            this.loadDashboards();
          }, 500);
        }
      } catch (error) {
        console.error(`Error deleting dashboard "${dashboard.title}":`, error);
        await this.notifier.errorKey('notifications.dashboard_delete_error');
      } finally {
        this.isLoading = false;
      }
    }
  }

  /**
   * Toggles the expansion state for a dashboard's sources with smooth animation.
   */
  toggleSourcesExpansion(dashboardId: string): void {
    const currentState = this.dashboardSourcesExpansionState.get(dashboardId);
    this.dashboardSourcesExpansionState.set(dashboardId, !currentState);
    
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  /**
   * Checks if a dashboard's sources are expanded.
   */
  isSourcesExpanded(dashboardId: string): boolean {
    return this.dashboardSourcesExpansionState.get(dashboardId) || false;
  }

  /**
   * Get the total number of classes across all sources for a dashboard
   */
  getTotalClassesCount(dashboard: Dashboard): number {
    if (!dashboard.sources) return 0;
    
    return dashboard.sources.reduce((total, source) => {
      return total + (source.classes?.length || 0);
    }, 0);
  }

  /**
   * Get the status color for a dashboard
   */
  getStatusColor(dashboard: Dashboard): string {
    switch (dashboard.status?.toLowerCase()) {
      case 'active':
        return 'bg-green-400';
      case 'inactive':
        return 'bg-red-400';
      case 'draft':
        return 'bg-yellow-400';
      default:
        return 'bg-green-400';
    }
  }

  /**
   * Get the status text for a dashboard
   */
  getStatusText(dashboard: Dashboard): string {
    return dashboard.status || 'Active';
  }

  /**
   * Handle keyboard navigation for accessibility
   */
  onKeyDown(event: KeyboardEvent, dashboard: Dashboard): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openDashboard(dashboard);
    }
  }

  /**
   * Handle keyboard navigation for expansion button
   */
  onExpansionKeyDown(event: KeyboardEvent, dashboardId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.toggleSourcesExpansion(dashboardId);
    }
  }
}
