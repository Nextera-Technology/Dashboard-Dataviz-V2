import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AdminLayoutComponent } from "../../components/admin-layout/admin-layout.component";
import { DashboardBuilderService } from "../dashboard-builder/dashboard-builder.service";

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
  dashboards: any[] = [];

  constructor(
    private dashboardService: DashboardBuilderService,
    private router: Router
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
      // Optionally, show a user-friendly error message
    }
  }

  openDashboard(dashboard: any): void {
    this.router.navigate(["/admin/dashboard-builder", dashboard._id]);
  }

  createNewDashboard(): void {
    // Navigate to a "new" route, the backend will handle ID generation on save
    this.router.navigate(["/admin/dashboard-builder", "new"]);
  }

  async deleteDashboard(dashboard: any, event: Event) {
    event.stopPropagation(); // Prevent card click event from firing
    if (confirm(`Are you sure you want to delete "${dashboard.title}"?`)) {
      try {
        const result = await this.dashboardService.deleteDashboard(
          dashboard._id
        );
        if (result) {
          // If deletion is successful, then update the local array and reload
          this.dashboards = this.dashboards.filter(
            (d) => d._id !== dashboard._id
          );
          console.log(`Dashboard "${dashboard.title}" deleted successfully.`);
          this.loadDashboards(); // Re-fetch to ensure data consistency with backend
        }
      } catch (error) {
        console.error(`Error deleting dashboard "${dashboard.title}":`, error);
        // Optionally, show a user-friendly error message
      }
    }
  }
}
