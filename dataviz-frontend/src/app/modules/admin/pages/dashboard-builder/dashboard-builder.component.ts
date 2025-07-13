import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { MatTabsModule } from "@angular/material/tabs";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { AdminLayoutComponent } from "../../components/admin-layout/admin-layout.component";
import { SectionFormDialogComponent } from "../../components/section-form-dialog/section-form-dialog.component";
import { DashboardBuilderService } from "./dashboard-builder.service";
import { WidgetFormDialogComponent } from "../../components/widget-form-dialog/widget-form-dialog.component";
import { WidgetConfigData } from "app/shared/services/dashboard.service";

// Define interfaces for better type safety based on your GraphQL queries and provided data
interface WidgetData {
  name: string;
  percentage?: number;
  count?: number;
  totalData?: number;
  wave?: number;
  averageSalary?: number;
  // Add other specific properties found in your widget data if needed
}

interface Widget {
  _id?: string; // Optional for new widgets
  chartType?: string;
  data?: WidgetData[]; // Using the more specific WidgetData interface
  name?: string;
  title: string;
  visible?: boolean;
  widgetType: string;
  widgetSubType?: string | null; // widgetSubType can be null based on data
  columnSize: number;
  rowSize: number;
  status?: string;
  section?: string; // To track which section it belongs to if moving between sections
}

interface Section {
  _id?: string; // Optional for new sections
  name?: string;
  background?: string;
  title: string;
  widgetIds: Widget[]; // Array of widgets within this section
  status?: string;
}

interface Dashboard {
  _id?: string; // Optional for new dashboards
  name?: string;
  sectionIds: Section[]; // Array of sections
  source?: string;
  title: string;
  status?: string;
}

@Component({
  selector: "app-dashboard-builder",
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
    AdminLayoutComponent,
  ],
  templateUrl: "./dashboard-builder.component.html",
  styleUrl: "./dashboard-builder.component.scss",
})
export class DashboardBuilderComponent implements OnInit, OnDestroy {
  dashboard?: Dashboard; // Use the Dashboard interface
  selectedTabIndex = 0;

  // For data source tag expansion
  widgetDataSourceExpansionState: Map<string, boolean> = new Map();
  initialVisibleDataSourceTags = 2; // Number of tags to show initially

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardBuilderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const dashboardId = this.route.snapshot.paramMap.get("id");
    if (dashboardId) {
      this.loadDashboard(dashboardId);
    } else {
      // Initialize a new dashboard if no ID is provided (e.g., /admin/dashboard-builder/new)
      this.dashboard = {
        title: "New Dashboard",
        name: "new-dashboard",
        sectionIds: [],
        source: "Manual",
        status: "Draft",
      };
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed (e.g., unsubscribe from observables)
  }

  async loadDashboard(id: string): Promise<void> {
    if (id === "new") {
      this.dashboard = {
        title: "New Dashboard",
        name: "new-dashboard",
        sectionIds: [],
        source: "Manual",
        status: "Draft",
      };
      return;
    }
    try {
      const result = await this.dashboardService.getOneDashboard(id);
      if (result) {
        this.dashboard = result;
        console.log("Loaded dashboard:", this.dashboard);
      } else {
        this.snackBar.open("Dashboard not found.", "Close", { duration: 3000 });
        this.router.navigate(["/admin/dashboard-list"]); // Redirect if not found
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      this.snackBar.open("Error loading dashboard.", "Close", {
        duration: 3000,
      });
      this.router.navigate(["/admin/dashboard-list"]);
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  onWidgetDrop(event: CdkDragDrop<Widget[]>, sectionIndex: number): void {
    if (!this.dashboard) return;

    if (event.previousContainer === event.container) {
      // Move within the same section
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.snackBar.open("Widget reordered.", "Close", { duration: 1500 });
    } else {
      // Move between sections
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update widget's section reference (if needed for backend persistence)
      const movedWidget = event.container.data[event.currentIndex];
      const targetSection = this.dashboard.sectionIds[sectionIndex];
      if (movedWidget && targetSection) {
        movedWidget.section = targetSection.title; // Or targetSection._id
        this.snackBar.open("Widget moved to a new section.", "Close", {
          duration: 1500,
        });
      }
    }
    // Consider calling a save/update function here if drag and drop needs to persist immediately
    // this.saveDashboard();
  }
  editWidget(widget: Widget): void {
    if (!this.dashboard || !this.dashboard.sectionIds) {
      this.snackBar.open(
        "Cannot edit widget: Dashboard or sections not loaded.",
        "Close",
        { duration: 3000 }
      );
      return;
    }

    // Find the parent section of the widget
    const parentSection = this.dashboard.sectionIds.find((s) =>
      s.widgetIds.some((w) => w._id === widget._id)
    );
    if (!parentSection) {
      this.snackBar.open(
        "Cannot edit widget: Parent section not found.",
        "Close",
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(WidgetFormDialogComponent, {
      width: "600px", // Match dialog's min-width
      data: {
        dashboard: this.dashboard,
        section: parentSection, // Pass the parent section
        widget: widget, // Pass the widget being edited
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // If save was successful in the dialog
        this.loadDashboard(this.dashboard!._id!); // Reload dashboard to reflect changes
      } else if (result === false) {
        console.log("Widget edit cancelled or failed.");
      }
    });
  }

  deleteWidget(widget: Widget): void {
    if (!this.dashboard || !this.dashboard.sectionIds) return;

    if (confirm(`Are you sure you want to delete "${widget.title}"?`)) {
      const currentSection = this.dashboard.sectionIds[this.selectedTabIndex];
      if (currentSection && currentSection.widgetIds) {
        const index = currentSection.widgetIds.findIndex(
          (w) => w._id === widget._id
        );
        if (index !== -1) {
          currentSection.widgetIds.splice(index, 1);
          this.snackBar.open(
            "Widget deleted locally. Remember to save dashboard.",
            "Close",
            { duration: 3000 }
          );
        }
      }
    }
  }

  async saveDashboard(): Promise<void> {
    if (!this.dashboard) {
      this.snackBar.open("No dashboard data to save.", "Close", {
        duration: 3000,
      });
      return;
    }

    try {
      let result;
      // Prepare payload to match backend schema, if needed (e.g., send only IDs for nested objects)
      // For now, assuming backend can handle the full nested structure for create/update.
      const dashboardToSave = { ...this.dashboard };
      // If sections/widgets need _id to be removed for creation, handle it here
      // For example, if new sections/widgets have temporary client-side _id:
      dashboardToSave.sectionIds = dashboardToSave.sectionIds.map(
        (section) => ({
          ...section,
          _id:
            section._id && section._id.startsWith("temp_")
              ? undefined
              : section._id,
          widgetIds: section.widgetIds.map((widget) => ({
            ...widget,
            _id:
              widget._id && widget._id.startsWith("temp_")
                ? undefined
                : widget._id,
          })),
        })
      );

      if (this.dashboard._id && this.dashboard._id !== "new") {
        // Update existing dashboard
        result = await this.dashboardService.updateDashboard(
          this.dashboard._id,
          dashboardToSave
        );
        this.snackBar.open("Dashboard updated successfully!", "Close", {
          duration: 3000,
        });
      } else {
        // Create new dashboard
        result = await this.dashboardService.createDashboard(dashboardToSave);
        if (result?._id) {
          this.dashboard._id = result._id; // Assign the new ID from backend
          this.router.navigate([
            "/admin/dashboard-builder",
            this.dashboard._id,
          ]); // Navigate to the new ID
          this.snackBar.open("Dashboard created successfully!", "Close", {
            duration: 3000,
          });
        } else {
          throw new Error("Failed to get ID for new dashboard.");
        }
      }
      console.log("Dashboard save result:", result);
    } catch (error) {
      console.error("Error saving dashboard:", error);
      this.snackBar.open("Error saving dashboard. Please try again.", "Close", {
        duration: 3000,
      });
    }
  }

  addSection(): void {
    // Ensure dashboard is loaded before trying to add a section
    if (!this.dashboard) {
      this.snackBar.open("Cannot add section: Dashboard not loaded.", "Close", {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: "450px",
      data: {
        dashboard: this.dashboard, // Pass the entire dashboard object
        section: undefined, // No specific section object for 'add' mode
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // If the dialog closed with a 'true' result, it means the save operation was successful
      if (result === true) {
        // Reload the dashboard to reflect the changes persisted by the dialog
        this.loadDashboard(this.dashboard!._id!);
      } else if (result === false) {
        // Handle dialog cancellation or failure from within the dialog
        console.log("Section add cancelled or failed.");
        this.snackBar.open("Section addition cancelled or failed.", "Close", {
          duration: 2000,
        });
      }
    });
  }

  editSection(section: Section): void {
    // Ensure dashboard is loaded before trying to edit a section
    if (!this.dashboard) {
      this.snackBar.open(
        "Cannot edit section: Dashboard not loaded.",
        "Close",
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: "450px",
      data: {
        dashboard: this.dashboard, // Pass the entire dashboard object
        section: section, // Pass the specific section object to be edited
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // If the dialog closed with a 'true' result, it means the save operation was successful
      if (result === true) {
        // Reload the dashboard to reflect the changes persisted by the dialog
        this.loadDashboard(this.dashboard!._id!);
      } else if (result === false) {
        // Handle dialog cancellation or failure from within the dialog
        console.log("Section edit cancelled or failed.");
        this.snackBar.open("Section update cancelled or failed.", "Close", {
          duration: 2000,
        });
      }
    });
  }

  deleteSection(section: Section): void {
    if (
      confirm(
        `Are you sure you want to delete section "${section.title}"? This will also delete all widgets in this section.`
      )
    ) {
      if (this.dashboard && this.dashboard.sectionIds) {
        const index = this.dashboard.sectionIds.findIndex(
          (s) => s._id === section._id || s.title === section.title // Use _id if available, fallback to title for new sections
        );
        if (index !== -1) {
          this.dashboard.sectionIds.splice(index, 1);
          if (this.selectedTabIndex >= this.dashboard.sectionIds.length) {
            this.selectedTabIndex = Math.max(
              0,
              this.dashboard.sectionIds.length - 1
            );
          }
          this.snackBar.open(
            "Section deleted locally. Remember to save dashboard.",
            "Close",
            {
              duration: 3000,
            }
          );
        }
      }
    }
  }

  addWidget(section: Section): void {
    if (!this.dashboard) {
      this.snackBar.open("Cannot add widget: Dashboard not loaded.", "Close", {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(WidgetFormDialogComponent, {
      width: "600px", // Match dialog's min-width
      data: {
        dashboard: this.dashboard,
        section: section, // Pass the section object
        widget: undefined, // No widget for 'add' mode
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // If save was successful in the dialog
        this.loadDashboard(this.dashboard!._id!); // Reload dashboard to reflect changes
      } else if (result === false) {
        console.log("Widget add cancelled or failed.");
      }
    });
  }

  goBack(): void {
    this.router.navigate(["/admin/dashboard-list"]);
  }

  // New method to get unique data source names for display
  getUniqueDataSourceNames(widget: Widget): string[] {
    if (!widget.data || widget.data.length === 0) {
      return [];
    }
    const names = widget.data
      .map((item) => item.name)
      .filter((name) => name !== undefined && name !== null);
    return [...new Set(names)]; // Return unique names
  }

  // Toggle expansion state for data source tags of a specific widget
  toggleDataSourceExpansion(widgetId: string): void {
    const currentState = this.widgetDataSourceExpansionState.get(widgetId);
    this.widgetDataSourceExpansionState.set(widgetId, !currentState);
  }

  // Check if data source tags are expanded for a specific widget
  isDataSourceExpanded(widgetId: string): boolean {
    return this.widgetDataSourceExpansionState.get(widgetId) || false;
  }

  // Returns the SVG icon string for a given widget type
  getWidgetIcon(type: string): string {
    const icons: { [key: string]: string } = {
      // Mapped to 'mat_solid' namespace based on common Material Design icons
      metric: "mat_solid:analytics",
      pie: "mat_solid:pie_chart",
      bar: "mat_solid:bar_chart",
      line: "mat_solid:show_chart",
      column: "mat_solid:stacked_bar_chart",
      sankey: "mat_solid:account_tree",
      table: "mat_solid:table_chart",
      text: "mat_solid:text_fields",
      map: "mat_solid:map",
      card: "mat_solid:dashboard", // Generic card icon
      further_studies: "mat_solid:school",
      domains: "mat_solid:category",
      education_level_target: "mat_solid:trending_up",
      same_different_school: "mat_solid:compare_arrows",
      status_by_wave: "mat_solid:timeline",
      professional_situation: "mat_solid:work",
      positions_functions: "mat_solid:people",
      salaries: "mat_solid:attach_money",
      skills: "mat_solid:lightbulb",
      satisfaction: "mat_solid:sentiment_satisfied",
      graduation_success: "mat_solid:grade",
      survey_distribution: "mat_solid:poll",
      survey_completion: "mat_solid:task_alt",
      manager_level: "mat_solid:supervisor_account",
      contract_types: "mat_solid:description",
      companies: "mat_solid:business",
      region: "mat_solid:public",
    };
    // Convert widgetType to lowercase for consistent lookup
    return icons[type.toLowerCase()] || "mat_solid:widgets"; // Default to generic widget icon
  }
}
