// import { Component, OnInit, OnDestroy } from "@angular/core";
// import { CommonModule, DatePipe } from "@angular/common";
// import { Router } from "@angular/router";
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
import { Router } from "@angular/router";
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    AdminLayoutComponent,
  ],
  templateUrl: "./dashboard-list.component.html",
  styleUrl: "./dashboard-list.component.scss",
})
export class DashboardListComponent implements OnInit {
  dashboards: Dashboard[] = [];
  // Map to store expansion state for sources per dashboard
  dashboardSourcesExpansionState: Map<string, boolean> = new Map();
  initialVisibleSources = 1; // Number of sources to show initially before collapsing
  isLoading = false;

  constructor(
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private dialog: MatDialog
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
        console.log("Dashboards loaded:", this.dashboards);
        
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

  openDashboard(dashboard: Dashboard): void {
    // Add smooth transition effect
    const element = event?.target as HTMLElement;
    if (element) {
      element.style.transform = 'scale(0.95)';
      element.style.transition = 'transform 0.1s ease';
      
      setTimeout(() => {
        this.router.navigate(["/admin/dashboard-builder", dashboard._id]);
      }, 100);
    } else {
      this.router.navigate(["/admin/dashboard-builder", dashboard._id]);
    }
  }

  createNewDashboard(): void {
    const dialogRef = this.dialog.open<
      DashboardFormDialogComponent,
      DashboardFormDialogData,
      boolean
    >(DashboardFormDialogComponent, {
      width: "600px",
      data: {},
      panelClass: 'modern-dialog',
      backdropClass: 'modern-backdrop',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.loadDashboards();
      }
    });
  }

  async deleteDashboard(dashboard: Dashboard, event: Event) {
    event.stopPropagation();
    
    // Modern confirmation dialog would be better, but keeping original functionality
    if (confirm(`Are you sure you want to delete "${dashboard.title}"?`)) {
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
          
          console.log(`Dashboard "${dashboard.title}" deleted successfully.`);
          
          // Refresh the list to ensure consistency
          setTimeout(() => {
            this.loadDashboards();
          }, 500);
        }
      } catch (error) {
        console.error(`Error deleting dashboard "${dashboard.title}":`, error);
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