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
    DatePipe,
  ],
  templateUrl: "./dashboard-list.component.html",
  styleUrl: "./dashboard-list.component.scss",
})
export class DashboardListComponent implements OnInit {
  dashboards: Dashboard[] = [];
  // Map to store expansion state for sources per dashboard
  dashboardSourcesExpansionState: Map<string, boolean> = new Map();
  initialVisibleSources = 1; // Number of sources to show initially before collapsing

  constructor(
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboards();
  }

  async loadDashboards() {
    try {
      const filter = {};
      const result =
        await this.dashboardService.getAllDashboards(filter);
      if (result?.data) {
        this.dashboards = result?.data;
        console.log("Dashboards loaded:", this.dashboards);
      }
    } catch (error) {
      console.error("Error loading dashboards:", error);
    }
  }

  openDashboard(dashboard: Dashboard): void {
    this.router.navigate(["/admin/dashboard-builder", dashboard._id]);
  }

  createNewDashboard(): void {
    const dialogRef = this.dialog.open<
      DashboardFormDialogComponent,
      DashboardFormDialogData,
      boolean
    >(DashboardFormDialogComponent, {
      width: "600px",
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.loadDashboards();
      }
    });
  }

  editDashboard(dashboard: Dashboard, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open<
      DashboardFormDialogComponent,
      DashboardFormDialogData,
      boolean
    >(DashboardFormDialogComponent, {
      width: "600px",
      data: {
        dashboard: dashboard,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.loadDashboards();
      }
    });
  }

  async deleteDashboard(dashboard: Dashboard, event: Event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${dashboard.title}"?`)) {
      try {
        const result = await this.dashboardService.deleteDashboard(
          dashboard._id
        );
        if (result) {
          this.dashboards = this.dashboards.filter(
            (d) => d._id !== dashboard._id
          );
          console.log(`Dashboard "${dashboard.title}" deleted successfully.`);
          this.loadDashboards();
        }
      } catch (error) {
        console.error(`Error deleting dashboard "${dashboard.title}":`, error);
      }
    }
  }

  /**
   * Toggles the expansion state for a dashboard's sources.
   */
  toggleSourcesExpansion(dashboardId: string): void {
    const currentState = this.dashboardSourcesExpansionState.get(dashboardId);
    this.dashboardSourcesExpansionState.set(dashboardId, !currentState);
  }

  /**
   * Checks if a dashboard's sources are expanded.
   */
  isSourcesExpanded(dashboardId: string): boolean {
    return this.dashboardSourcesExpansionState.get(dashboardId) || false;
  }
}
