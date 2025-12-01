import { Component, OnInit, OnDestroy, Injectable } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
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
import { TranslationService } from 'app/shared/services/translation/translation.service';
import { PdfExportDialogComponent, PdfExportDialogData, PdfExportResult } from 'app/shared/components/pdf-export-dialog/pdf-export-dialog.component';

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
  isDuplicationProcessInProgress?: boolean;
}

@Component({
  selector: "app-job-description-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
export class JobDescriptionListComponent implements OnInit, OnDestroy {
  dashboards: Dashboard[] = [];
  filteredDashboards: Dashboard[] = [];
  // Map to store expansion state for sources per dashboard
  dashboardSourcesExpansionState: Map<string, boolean> = new Map();
  initialVisibleSources = 1; // Number of sources to show initially before collapsing
  isLoading = false;
  
  // View mode: 'card' or 'table'
  viewMode: 'card' | 'table' = 'card';
  
  // Search query
  searchQuery: string = '';
  
  // Prevent double dialog opening
  private isDialogOpen = false;

  private createDashboardListener: any;

  constructor(
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private shareDataService: ShareDataService,
    private notifier: NotificationService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadDashboards();
    
    // Listen for create dashboard event from admin layout header
    this.createDashboardListener = this.handleCreateDashboard.bind(this);
    window.addEventListener('admin-create-dashboard', this.createDashboardListener);
    
    // Listen for scrollTo query parameter (from table view redirect)
    this.route.queryParams.subscribe(params => {
      if (params['scrollTo']) {
        const dashboardId = params['scrollTo'];
        // Wait for dashboards to load, then scroll
        setTimeout(() => this.scrollToDashboard(dashboardId), 300);
        // Clear the query param after scrolling
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up event listener
    if (this.createDashboardListener) {
      window.removeEventListener('admin-create-dashboard', this.createDashboardListener);
    }
  }

  /**
   * Handle create dashboard event from header button
   */
  handleCreateDashboard(): void {
    this.createNewDashboard();
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
        this.filteredDashboards = [...this.dashboards];
        
        // Initialize expansion state for new dashboards
        this.dashboards.forEach(dashboard => {
          if (dashboard._id && !this.dashboardSourcesExpansionState.has(dashboard._id)) {
            this.dashboardSourcesExpansionState.set(dashboard._id, false);
          }
        });
        
        // Apply search filter if there's a query
        if (this.searchQuery) {
          this.onSearch(this.searchQuery);
        }
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

  async openDashboard(dashboard: Dashboard, event?: Event): Promise<void> {
    // Prevent bubbling when called from button click
    if (event) {
      event.stopPropagation();
    }

    // Step 1: Validate dashboard ID
    if (!dashboard._id) {
      await this.notifier.toastKey('notifications.no_dashboard_to_view', 'info', undefined, 3000);
      return;
    }

    try {
      // Step 2: Fetch the latest dashboard data to ensure up-to-date information
      const latestDashboard = await this.dashboardService.getOneDashboard(dashboard._id);
      if (!latestDashboard) {
        await this.notifier.toastKey('notifications.dashboard_not_found', 'error', undefined, 3000);
        return;
      }

      // Step 3: Check if duplication process is in progress
      if (latestDashboard.isDuplicationProcessInProgress) {
        await this.notifier.infoKey('notifications.duplication_in_progress', undefined, 8000);
        return;
      }

      // Step 4: Proceed with school selection dialog
      this.openSchoolSelectionDialog(latestDashboard);
    } catch (error) {
      console.error('Error fetching latest dashboard data:', error);
      await this.notifier.errorKey('notifications.error_loading_dashboard');
    }
  }

  private openSchoolSelectionDialog(dashboard: Dashboard): void {
    // Prevent double dialog opening
    if (this.isDialogOpen) {
      return;
    }
    this.isDialogOpen = true;
    
    const dialogRef = this.dialog.open(SchoolSelectionDialogComponent, {
      width: '600px',
      data: {
        dashboardId: dashboard._id,
        dashboardTitle: dashboard.title || dashboard.name || 'Dashboard',
        isEmployabilitySurvey: false // JD Dashboard - do not pass employability flag
      },
      panelClass: 'modern-dialog',
      backdropClass: 'loading-backdrop',
      disableClose: false,
      hasBackdrop: true,
      closeOnNavigation: true,
      autoFocus: 'first-tabbable' // Ensure proper focus management
    });

    dialogRef.afterClosed().subscribe(async (result: SchoolSelectionResult | undefined) => {
      // Reset flag when dialog closes
      this.isDialogOpen = false;
      
      if (result) {
        
        // Show loading spinner
        const loadingMessage = result.openWithAllData 
          ? this.translationService.translate('shared.dashboard.loading.opening_dashboard')
          : this.translationService.translate('shared.dashboard.loading.applying_school_filters')
            .replace('{{schools}}', result.selectedSchools.join(', '));
            
        const loadingDialogRef = this.dialog.open(LoadingSpinnerDialogComponent, {
          width: '340px',
          disableClose: true,
          hasBackdrop: true,
          backdropClass: 'loading-backdrop',
          panelClass: 'loading-dialog',
          data: {
            message: loadingMessage
          }
        });
        
        try {
          // Always use school filter query, but pass all schools for "all data" option
          const schoolsToFilter = result.openWithAllData 
            ? ['ALL'] // All available schools
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
              ? this.translationService.translate('shared.dashboard.notifications.opened_all_data')
              : this.translationService.translate('shared.dashboard.notifications.opened_filtered_data').replace('{{schools}}', result.selectedSchools.join(', '));
            
            const title = this.translationService.translate('shared.dashboard.notifications.opened_title');
            await this.notifier.success(message, title);
          } else {
            const errorMessage = this.translationService.translate('shared.dashboard.notifications.failed_open_filter');
            const errorTitle = this.translationService.translate('shared.dashboard.notifications.error_title');
            await this.notifier.error(errorMessage, errorTitle);
          }
        } catch (error) {
          loadingDialogRef.close();
          console.error('Error opening dashboard:', error);
          const errorMessage = this.translationService.translate('shared.dashboard.notifications.failed_open_generic');
          const errorTitle = this.translationService.translate('shared.dashboard.notifications.error_title');
          await this.notifier.error(errorMessage, errorTitle);
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

  exportToPDF(dashboard: Dashboard, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!dashboard || !dashboard._id) return;
    const isES = false;

    const dialogRef = this.dialog.open(PdfExportDialogComponent, {
      width: '600px',
      data: {
        dashboardId: dashboard._id,
        dashboardTitle: dashboard.title || dashboard.name || 'Dashboard',
        isEmployabilitySurvey: isES
      },
      panelClass: 'modern-dialog',
      backdropClass: 'modern-backdrop'
    });

    dialogRef.afterClosed().subscribe((result: PdfExportResult | null) => {
      if (!result) return;
      try {
        const key = `DV_AUTO_EXPORT_OPTS_${dashboard._id}`;
        localStorage.setItem(key, JSON.stringify(result));
      } catch {}
      this.shareDataService.setDashboardId(dashboard._id);
      const url = `${location.origin}/dashboard?autoExport=1&id=${encodeURIComponent(dashboard._id)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
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
      // If dialog returned a dashboard id (string), redirect to view that dashboard
      if (typeof result === 'string' && result.length > 0) {
        this.shareDataService.setDashboardId(result);
        this.router.navigate(['/dashboard']);
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
        typeOfUsage: (dashboard as any)?.typeOfUsage || 'JOB_DESCRIPTION_EVALUATION'
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
          // Remove from both local arrays immediately for instant UI update
          this.dashboards = this.dashboards.filter(d => d._id !== dashboard._id);
          this.filteredDashboards = this.filteredDashboards.filter(d => d._id !== dashboard._id);

          // Clean up expansion state
          if (dashboard._id) {
            this.dashboardSourcesExpansionState.delete(dashboard._id);
          }

          await this.notifier.successKey('notifications.dashboard_deleted', { title: dashboard.title });
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

  /**
   * Switch view mode between card and table
   * When table is selected, redirect to job-description-table page
   */
  setViewMode(mode: 'card' | 'table'): void {
    if (mode === 'table') {
      // Redirect to table view page
      this.router.navigate(['/admin/job-description-table']);
    } else {
      this.viewMode = mode;
      localStorage.setItem('job-description-list-view-mode', mode);
    }
  }

  /**
   * Search/filter dashboards
   */
  onSearch(query: string): void {
    this.searchQuery = query.toLowerCase().trim();
    
    if (!this.searchQuery) {
      this.filteredDashboards = [...this.dashboards];
      return;
    }
    
    this.filteredDashboards = this.dashboards.filter(dashboard => {
      // Search in title
      if (dashboard.title?.toLowerCase().includes(this.searchQuery)) {
        return true;
      }
      
      // Search in name
      if (dashboard.name?.toLowerCase().includes(this.searchQuery)) {
        return true;
      }
      
      // Search in sources certification names
      if (dashboard.sources) {
        const hasMatchInSources = dashboard.sources.some(source => 
          source.certification?.toLowerCase().includes(this.searchQuery) ||
          source.classes?.some(cls => cls.toLowerCase().includes(this.searchQuery))
        );
        if (hasMatchInSources) {
          return true;
        }
      }
      
      return false;
    });
  }
}
