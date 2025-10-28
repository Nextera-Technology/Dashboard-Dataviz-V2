// import { Component, OnInit, OnDestroy } from "@angular/core";
// import { CommonModule, DatePipe } from "@angular/common";
// import { FormsModule } from "@angular/forms";
// import { Router, ActivatedRoute } from "@angular/router";
// import { MatCardModule } from "@angular/material/card";
// import { MatButtonModule } from "@angular/material/button";
// import { MatIconModule } from "@angular/material/icon";
// import { MatChipsModule } from "@angular/material/chips";
// import { MatTooltipModule } from "@angular/material/tooltip";
// import { AdminLayoutComponent } from "../../components/admin-layout/admin-layout.component";
// import { DashboardBuilderService } from "../dashboard-builder/dashboard-builder.service";
// import { MatDialog } from "@angular/material/dialog";
// import {
//   DashboardFormDialogComponent,
//   DashboardFormDialogData,
// } from "../../components/dashboard-form-dialog/dashboard-form-dialog.component";

// // UPDATED: Dashboard interface to reflect the new 'sources' array structure
// interface Section {
//   _id?: string;
//   name?: string;
//   background?: string;
//   title: string;
//   widgetIds: any[];
//   status?: string;
// }

// interface Dashboard {
//   _id?: string;
//   name?: string;
//   sectionIds: Section[];
//   sources?: { certification: string | null; classes: string[] | null }[]; // Updated source structure
//   title: string;
//   status?: string;
// }

// @Component({
//   selector: "app-dashboard-list",
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatCardModule,
//     MatButtonModule,
//     MatIconModule,
//     MatChipsModule,
//     MatTooltipModule,
//     AdminLayoutComponent,
//   ],
//   templateUrl: "./dashboard-list.component.html",
//   styleUrl: "./dashboard-list.component.scss",
// })
// export class DashboardListComponent implements OnInit {
//   dashboards: Dashboard[] = [];
//   // Map to store expansion state for sources per dashboard
//   dashboardSourcesExpansionState: Map<string, boolean> = new Map();
//   initialVisibleSources = 1; // Number of sources to show initially before collapsing

//   constructor(
//     private dashboardService: DashboardBuilderService,
//     private router: Router,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit(): void {
//     this.loadDashboards();
//   }

//   async loadDashboards() {
//     try {
//       const filter = {};
//       const result =
//         await this.dashboardService.getAllDashboards(filter);
//       if (result?.data) {
//         this.dashboards = result?.data;
//         console.log("Dashboards loaded:", this.dashboards);
//       }
//     } catch (error) {
//       console.error("Error loading dashboards:", error);
//     }
//   }

//   openDashboard(dashboard: Dashboard): void {
//     this.router.navigate(["/admin/dashboard-builder", dashboard._id]);
//   }

//   createNewDashboard(): void {
//     const dialogRef = this.dialog.open<
//       DashboardFormDialogComponent,
//       DashboardFormDialogData,
//       boolean
//     >(DashboardFormDialogComponent, {
//       width: "600px",
//       data: {},
//     });

//     dialogRef.afterClosed().subscribe((result) => {
//       if (result === true) {
//         this.loadDashboards();
//       }
//     });
//   }

//   editDashboard(dashboard: Dashboard, event: Event): void {
//     event.stopPropagation();

//     const dialogRef = this.dialog.open<
//       DashboardFormDialogComponent,
//       DashboardFormDialogData,
//       boolean
//     >(DashboardFormDialogComponent, {
//       width: "600px",
//       data: {
//         dashboard: dashboard,
//       },
//     });

//     dialogRef.afterClosed().subscribe((result) => {
//       if (result === true) {
//         this.loadDashboards();
//       }
//     });
//   }

//   async deleteDashboard(dashboard: Dashboard, event: Event) {
//     event.stopPropagation();
//     if (confirm(`Are you sure you want to delete "${dashboard.title}"?`)) {
//       try {
//         const result = await this.dashboardService.deleteDashboard(
//           dashboard._id
//         );
//         if (result) {
//           this.dashboards = this.dashboards.filter(
//             (d) => d._id !== dashboard._id
//           );
//           console.log(`Dashboard "${dashboard.title}" deleted successfully.`);
//           this.loadDashboards();
//         }
//       } catch (error) {
//         console.error(`Error deleting dashboard "${dashboard.title}":`, error);
//       }
//     }
//   }

//   /**
//    * Toggles the expansion state for a dashboard's sources.
//    */
//   toggleSourcesExpansion(dashboardId: string): void {
//     const currentState = this.dashboardSourcesExpansionState.get(dashboardId);
//     this.dashboardSourcesExpansionState.set(dashboardId, !currentState);
//   }

//   /**
//    * Checks if a dashboard's sources are expanded.
//    */
//   isSourcesExpanded(dashboardId: string): boolean {
//     return this.dashboardSourcesExpansionState.get(dashboardId) || false;
//   }
// }

import { Component, OnInit, OnDestroy } from "@angular/core";
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
import {
  DashboardFormDialogComponent,
  DashboardFormDialogData,
} from "../../components/dashboard-form-dialog/dashboard-form-dialog.component";
import { ShareDataService } from "app/shared/services/share-data.service";
import Swal from 'sweetalert2';
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';

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
  selector: "app-dashboard-list",
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
  templateUrl: "./dashboard-list.component.html",
  styleUrl: "./dashboard-list.component.scss",
})
export class DashboardListComponent implements OnInit {
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
 
  private createDashboardListener: any;

  constructor(
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private shareDataService: ShareDataService,
    private notifier: NotificationService
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

  openDashboard(dashboard: Dashboard, event?: Event): void {
    // Prevent bubbling when called from button click
    if (event) {
      event.stopPropagation();
    }

    // Try to animate the clicked element, fall back to card element
    const clickedEl = (event && ((event.currentTarget as HTMLElement) || (event.target as HTMLElement))) || null;
    const cardEl = document.querySelector(`[data-dashboard-id="${dashboard._id}"]`) as HTMLElement | null;

    const elToAnimate = clickedEl || cardEl;
    if (elToAnimate) {
      elToAnimate.style.transform = 'scale(0.95)';
      elToAnimate.style.transition = 'transform 0.1s ease';
      setTimeout(() => {
        this.shareDataService.setDashboardId(dashboard._id || '');
        this.router.navigate(['/dashboard']);
      }, 100);
      return;
    }

    // Fallback navigation
    this.shareDataService.setDashboardId(dashboard._id || '');
    this.router.navigate(['/dashboard']);
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
      data: {},
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

  /**
   * Switch view mode between card and table
   * When table is selected, redirect to dashboard-table page
   */
  setViewMode(mode: 'card' | 'table'): void {
    if (mode === 'table') {
      // Redirect to table view page
      this.router.navigate(['/admin/dashboard-table']);
    } else {
      this.viewMode = mode;
      localStorage.setItem('dashboard-list-view-mode', mode);
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