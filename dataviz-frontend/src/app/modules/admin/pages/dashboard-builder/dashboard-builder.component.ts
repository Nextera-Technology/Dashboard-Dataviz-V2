import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
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
// CORRECTED IMPORT PATH AND COMPONENT NAME:
import {
  WidgetFormDialogComponent,
  WidgetConfigData,
} from "../../components/widget-form-dialog/widget-form-dialog.component"; // Corrected import path and component name
import { SectionFormDialogComponent } from "../../components/section-form-dialog/section-form-dialog.component";
import { DashboardBuilderService } from "./dashboard-builder.service";
import { MetricWidgetComponent } from "app/shared/components/widgets/metric-widget/metric-widget.component";
import { BarChartWidgetComponent } from "app/shared/components/widgets/bar-chart-widget/bar-chart-widget.component";
import { ColumnChartWidgetComponent } from "app/shared/components/widgets/column-chart-widget/column-chart-widget.component";
import { LineChartWidgetComponent } from "app/shared/components/widgets/line-chart-widget/line-chart-widget.component";
import { PieChartWidgetComponent } from "app/shared/components/widgets/pie-chart-widget/pie-chart-widget.component";
import { SankeyChartWidgetComponent } from "app/shared/components/widgets/sankey-chart-widget/sankey-chart-widget.component";
import { MapWidgetComponent } from "app/shared/components/widgets/map-widget/map-widget.component";
import { SimpleTableWidgetComponent } from "app/shared/components/widgets/simple-table-widget/simple-table-widget.component";
import { StatusGridWidgetComponent } from "app/shared/components/widgets/status-grid-widget/status-grid-widget.component";
import { TextWidgetComponent } from "app/shared/components/widgets/text-widget/text-widget.component";
import { PictorialStackedChartWidgetComponent } from "app/shared/components/widgets/pictorial-fraction-chart/pictorial-fraction-chart.component";
import { WorldMapWidgetComponent } from "app/shared/components/widgets/world-map-widget/world-map-widget.component";
import { RadarChartWidgetComponent } from "app/shared/components/widgets/radar-chart-widget/radar-chart-widget.component";
import { DonutChartWidgetComponent } from "app/shared/components/widgets/donut-chart-widget/donut-chart-widget.component";
import { AnimatedGaugeWidgetComponent } from "app/shared/components/widgets/animated-gauge-widget/animated-gauge-widget.component";
import { YesNoGaugeWidgetComponent } from "app/shared/components/widgets/yes-no-gauge-widget/yes-no-gauge-widget.component";

// Define interfaces for better type safety based on your GraphQL queries
interface WidgetData {
  name: string;
  percentage?: number;
  count?: number;
  totalData?: number;
  wave?: number;
  averageSalary?: number;
}

interface Widget {
  _id?: string;
  chartType?: string;
  data?: WidgetData[];
  name?: string;
  title: string;
  visible?: boolean;
  widgetType: string;
  widgetSubType?: string | null;
  columnSize: number;
  rowSize: number;
  status?: string;
  section?: string;
  background?: string;
  followUpStage?: string | null;
}

interface Section {
  _id?: string;
  name?: string;
  background?: string;
  title: string;
  widgetIds: Widget[];
  status?: string;
}

interface Dashboard {
  _id?: string;
  name?: string;
  sectionIds: Section[];
  sources?: { certification: string | null; classes: string[] | null }[];
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
    // Import all atom widget components for dynamic rendering
    MetricWidgetComponent,
    BarChartWidgetComponent,
    ColumnChartWidgetComponent,
    LineChartWidgetComponent,
    PieChartWidgetComponent,
    SankeyChartWidgetComponent,
    MapWidgetComponent,
    SimpleTableWidgetComponent,
    StatusGridWidgetComponent,
    TextWidgetComponent,
    PictorialStackedChartWidgetComponent,
    WorldMapWidgetComponent,
    RadarChartWidgetComponent,
    DonutChartWidgetComponent,
    AnimatedGaugeWidgetComponent,
    YesNoGaugeWidgetComponent,
  ],
  templateUrl: "./dashboard-builder.component.html",
  styleUrl: "./dashboard-builder.component.scss",
})
export class  DashboardBuilderComponent implements OnInit, OnDestroy {
  dashboard?: Dashboard;
  widgetSectionList = [];
  selectedTabIndex = 0;

  // For data source tag expansion
  widgetDataSourceExpansionState: Map<string, boolean> = new Map();
  initialVisibleDataSourceTags = 2; // Number of tags to show initially
  @ViewChildren("widgetCard") widgetCards!: QueryList<ElementRef>;

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
      this.dashboard = {
        title: "New Dashboard",
        name: "new-dashboard",
        sectionIds: [],
        sources: [],
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
        sources: [],
        status: "Draft",
      };
      return;
    }
    try {
      const result = await this.dashboardService.getOneDashboard(id);
      if (result) {
        this.dashboard = result;

        // Assign fallback chartType when missing to avoid placeholder rendering
        this.dashboard.sectionIds?.forEach((sec) => {
          sec.widgetIds?.forEach((w) => {
            if (!w.chartType || w.chartType.trim() === "") {
              // Simple heuristic mapping – extend as required
              if (w.widgetSubType === "STATUS_WAVE_BREAKDOWN") {
                w.chartType = "HorizontalStackedChart";
              } else if (w.widgetSubType === "STATUS_EVOLUTION") {
                w.chartType = "LineChart";
              } else if (w.widgetSubType === "POSITION_TOP3_COMPARISON") {
                w.chartType = "PieChart";
              } else {
                // Generic fallback – treat as PieChart
                w.chartType = "PieChart";
              }
            }
          });
        });

      if(this.dashboard.sectionIds.length > 0) {
        this.widgetSectionList = [
          ...this.dashboard?.sectionIds?.[0]?.widgetIds,
        ];
        console.log("Loaded dashboard:", this.dashboard);
      }
      } else {
        this.snackBar.open("Dashboard not found.", "Close", { duration: 3000 });
        this.router.navigate(["/admin/dashboard-list"]);
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
    this.widgetSectionList = [
      ...this.dashboard?.sectionIds?.[index]?.widgetIds,
    ];
  }

  onWidgetDrop(event: CdkDragDrop<Widget[]>, sectionIndex: number): void {
    if (!this.dashboard) return;
  
    const mutableWidgets = [...this.widgetSectionList];
    moveItemInArray(mutableWidgets, event.previousIndex, event.currentIndex);
    this.widgetSectionList = mutableWidgets;
    
    // Create a new array of sections with the updated widgets
    if (this.dashboard.sectionIds && this.dashboard.sectionIds[this.selectedTabIndex]) {
      const updatedSections = this.dashboard.sectionIds.map((section, idx) => {
        if (idx === this.selectedTabIndex) {
          // For the current section, update its widgets
          return {
            ...section,
            widgetIds: [...mutableWidgets]
          };
        }
        // For other sections, keep them as is
        return section;
      });
      
      // Update the dashboard with the new sections array
      this.dashboard = {
        ...this.dashboard,
        sectionIds: updatedSections
      };
    }
    
    this._saveSection();
  }

  onSectionDrop(event: CdkDragDrop<any[]>): void {
    if (!this.dashboard || !this.dashboard.sectionIds) return;
    
    // Get the current selected tab before reordering
    const currentSelectedSection = this.dashboard.sectionIds[this.selectedTabIndex];
    const mutableSectionIds = [...this.dashboard.sectionIds];
    
    // Reorder sections in the mutable copy
    moveItemInArray(mutableSectionIds, event.previousIndex, event.currentIndex);
    
    this.dashboard = {
      ...this.dashboard,
      sectionIds: mutableSectionIds
    };
    
    const newSelectedIndex = this.dashboard.sectionIds.findIndex(
      section => section._id === currentSelectedSection._id
    );
    
    this.selectedTabIndex = newSelectedIndex >= 0 ? newSelectedIndex : 0;
    this.widgetSectionList = [...this.dashboard.sectionIds[this.selectedTabIndex].widgetIds];
    
    // Save the dashboard with the new section order but don't reload
    // as reloading is causing the order to revert
    this.saveDashboardWithoutReload();
  }

  // New method to save dashboard without reloading
  async saveDashboardWithoutReload(): Promise<void> {
    if (!this.dashboard) {
      this.snackBar.open("No dashboard data to save.", "Close", {
        duration: 3000,
      });
      return;
    }

    try {
      // Instead of modifying the dashboard object, create a new input object with only the fields
      // that are expected by the UpdateDashboardInput type
      const updateInput = {
        name: this.dashboard.name,
        title: this.dashboard.title,
        sectionIds: this.dashboard.sectionIds
          .map((section: Section) => section._id && !section._id.startsWith("temp_") ? section._id : undefined)
          .filter(Boolean),
        sources: this.dashboard.sources
      };

      let result;
      if (this.dashboard._id && this.dashboard._id !== "new") {
        result = await this.dashboardService.updateDashboard(
          this.dashboard._id,
          updateInput
        );
        console.log("Dashboard updated with new section order:", result);
        this.snackBar.open("Section order updated!", "Close", { duration: 2000 });
      } else {
        result = await this.dashboardService.createDashboard(updateInput);
        if (result?._id) {
          // Create a new dashboard object with the new ID
          this.dashboard = {
            ...this.dashboard,
            _id: result._id
          };
          this.snackBar.open("Dashboard created with new section order!", "Close", { duration: 2000 });
        }
      }
    } catch (error) {
      console.error("Error saving dashboard section order:", error);
      this.snackBar.open("Error saving section order. Please try again.", "Close", {
        duration: 3000
      });
    }
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

    // CORRECTED COMPONENT NAME:
    const dialogRef = this.dialog.open(WidgetFormDialogComponent, {
      // Changed to WidgetFormDialogComponent
      width: "600px",
      data: {
        dashboard: this.dashboard,
        section: parentSection,
        widget: widget,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?._id) {
        this.loadDashboard(this.dashboard!._id!);
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
      // Create a new input object with only the fields expected by the UpdateDashboardInput type
      const updateInput = {
        name: this.dashboard.name,
        title: this.dashboard.title,
        sectionIds: this.dashboard.sectionIds
          .map((section: Section) => section._id && !section._id.startsWith("temp_") ? section._id : undefined)
          .filter(Boolean),
        sources: this.dashboard.sources
      };

      let result;
      if (this.dashboard._id && this.dashboard._id !== "new") {
        result = await this.dashboardService.updateDashboard(
          this.dashboard._id,
          updateInput
        );
        this.snackBar.open("Dashboard updated successfully!", "Close", {
          duration: 3000,
        });
      } else {
        result = await this.dashboardService.createDashboard(updateInput);
        if (result?._id) {
          this.dashboard._id = result._id;
          this.router.navigate([
            "/admin/dashboard-builder",
            this.dashboard._id,
          ]);
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
    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: "450px",
      data: {
        dashboard: this.dashboard,
        title: "New Section",
        background: "#f5f5f5",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?._id) {
        this.loadDashboard(this.dashboard!._id!);
      }
    });
  }

  editSection(section: Section): void {
    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: "450px",
      data: {
        dashboard: this.dashboard,
        section: section,
        title: section.title,
        background: section.background,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?._id) {
        this.loadDashboard(this.dashboard!._id!);
      }
    });
  }

  addWidget(section: Section): void {
    if (!this.dashboard) {
      this.snackBar.open("Cannot add widget: Dashboard not loaded.", "Close", {
        duration: 3000,
      });
      return;
    }

    // CORRECTED COMPONENT NAME:
    const dialogRef = this.dialog.open(WidgetFormDialogComponent, {
      // Changed to WidgetFormDialogComponent
      width: "600px",
      data: {
        dashboard: this.dashboard,
        section: section,
        widget: undefined,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?._id) {
        this.loadDashboard(this.dashboard!._id!);
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
      metric: "mat_solid:analytics",
      pie: "mat_solid:pie_chart",
      bar: "mat_solid:bar_chart",
      line: "mat_solid:show_chart",
      column: "mat_solid:stacked_bar_chart",
      sankey: "mat_solid:account_tree",
      table: "mat_solid:table_chart",
      text: "mat_solid:text_fields",
      map: "mat_solid:map",
      card: "mat_solid:dashboard",
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
      survey_completion: "mat_solid:task_alt",
      survey_distribution: "mat_solid:poll",
      manager_level: "mat_solid:supervisor_account",
      contract_types: "mat_solid:description",
      companies: "mat_solid:business",
      region: "mat_solid:public",
    };
    return icons[type.toLowerCase()] || "mat_solid:widgets";
  }

  // Normalize chartType for switch matching (lowercase, no spaces)
  chartKey(type?: string | null): string {
    return (type || "").toLowerCase();
  }

  /**
   * Saves or updates the section by modifying the dashboard object
   * and calling the dashboard service's update method.
   */
  private async _saveSection(): Promise<void> {
    const section = this.dashboard?.sectionIds?.[this.selectedTabIndex];
    if (!section || !section._id) {
      console.error("Cannot save section: No section selected or section has no ID");
      return;
    }

    try {
      // Create a mutable copy of the widget IDs to avoid read-only issues
      // Extract only the widget IDs, not the entire widget objects
      const widgetIds = this.widgetSectionList.map(widget => 
        widget._id && !widget._id.startsWith('temp_') ? widget._id : undefined
      ).filter(Boolean);
      
      const sectionPayload = {
        widgetIds: widgetIds,
        // Include other section properties that might need to be preserved
        title: section.title,
        background: section.background,
        name: section.name
      };
      
      console.log("Saving section with widget order:", sectionPayload);
      
      // Update existing dashboard with modified sections
      const result = await this.dashboardService.updateSection(
        section._id,
        sectionPayload
      );
      
      console.log("Section update result:", result);
    } catch (error) {
      console.error("Error saving section:", error);
      this.snackBar.open("Error saving widget order. Please try again.", "Close", {
        duration: 3000
      });
    }
  }

  trackById(index: number, item: any): string {
    return item._id;
  }
}
