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
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { OverlayModule, CdkOverlayOrigin } from "@angular/cdk/overlay";
import { AdminLayoutComponent } from "../../components/admin-layout/admin-layout.component";
// CORRECTED IMPORT PATH AND COMPONENT NAME:
import {
  WidgetFormDialogComponent,
  WidgetConfigData,
} from "../../components/widget-form-dialog/widget-form-dialog.component"; // Corrected import path and component name
import { SectionFormDialogComponent } from "../../components/section-form-dialog/section-form-dialog.component";
import { DashboardBuilderService } from "./dashboard-builder.service";
import { MetricWidgetComponent } from "app/shared/components/widgets/metric-widget/metric-widget.component";
import { LineChartWidgetComponent } from "app/shared/components/widgets/line-chart-widget/line-chart-widget.component";
import { PieChartWidgetComponent } from "app/shared/components/widgets/pie-chart-widget/pie-chart-widget.component";
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
import { BarChartWidgetComponent } from "app/modules/dashboard/charts/bar-chart-widget.component";
import { ShareDataService } from "app/shared/services/share-data.service";
import { BreakDownChartWidgetComponent } from "app/modules/dashboard/charts/breakdown-chart-widget.component";
import { SankeyChartWidgetComponent } from "app/modules/dashboard/charts/sankey-chart-widget.component";
import { ColumnChartWidgetComponent } from "app/modules/dashboard/charts/column-chart-widget.component";
import { InformationDialogComponent } from "app/shared/components/action-dialogs/information-dialog/information-dialog.component";
import { DataSourceQuickInfoDialogComponent } from "app/shared/components/action-dialogs/data-source-quick-info-dialog/data-source-quick-info-dialog.component";
import { DashboardBuilderRepository } from "@dataviz/repositories/dashboard-builder/dashboard-builder.repository";
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { TranslationService } from 'app/shared/services/translation/translation.service';

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
    OverlayModule,
    AdminLayoutComponent,
    // translation pipe
    TranslatePipe,
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
    BreakDownChartWidgetComponent
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

  // Quick info popover state
  quickInfoOpen = false;
  quickInfoWidget?: Widget;
  quickInfoOrigin?: CdkOverlayOrigin;
  positions: any[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  ];

  // Per-widget state to hide/show the info (size + data source)
  private widgetInfoHiddenState: Map<string, boolean> = new Map<string, boolean>();

  // Flag to prevent multiple dialog opens
  isOpeningDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardBuilderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private shareDataService: ShareDataService,
    private dashboardBuilderRepository: DashboardBuilderRepository,
    private notifier: NotificationService,
    private translation: TranslationService
  ) {
     shareDataService.setIsDashboard(false);
  }

  /**
   * Opens the main dashboard view in a new browser tab.
   * Sets the dashboard id in ShareDataService so the dashboard page can load the correct dashboard.
   */
  async viewDashboard(): Promise<void> {
    if (!this.dashboard || !this.dashboard._id) {
      await this.notifier.toastKey('notifications.no_dashboard_to_view', 'info', undefined, 3000);
      return;
    }

    // Persist id for the dashboard page to read
    this.shareDataService.setDashboardId(this.dashboard._id);

    // Build the URL for the dashboard route and open in new tab
    const url = `${window.location.origin}/#/dashboard`;
    window.open(url, '_blank');
  }

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
      // Preserve currently selected section to restore selection after reload
      const prevSelectedSectionId = this.dashboard?.sectionIds?.[this.selectedTabIndex]?._id;

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

      if (this.dashboard.sectionIds.length > 0) {
        // Try to restore previously selected section index
        let nextIndex = 0;
        if (prevSelectedSectionId) {
          const foundIndex = this.dashboard.sectionIds.findIndex(sec => sec._id === prevSelectedSectionId);
          nextIndex = foundIndex !== -1 ? foundIndex : 0;
        }
        this.selectedTabIndex = nextIndex;
        this.widgetSectionList = [
          ...this.dashboard.sectionIds[this.selectedTabIndex].widgetIds,
        ];
      }
      } else {
        await this.notifier.toastKey('notifications.dashboard_not_found', 'error', undefined, 3000);
        this.router.navigate(["/admin/dashboard-list"]);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      await this.notifier.errorKey('notifications.error_loading_dashboard');
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
      await this.notifier.error('No data', 'No dashboard data to save.');
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
        await this.notifier.toastKey('notifications.section_order_updated', 'success', undefined, 2000);
      } else {
        result = await this.dashboardService.createDashboard(updateInput);
        if (result?._id) {
          // Create a new dashboard object with the new ID
          this.dashboard = {
            ...this.dashboard,
            _id: result._id
          };
          await this.notifier.toastKey('notifications.dashboard_created_section_order', 'success', undefined, 2000);
        }
      }
    } catch (error) {
      console.error("Error saving dashboard section order:", error);
      await this.notifier.errorKey('notifications.save_error');
    }
  }

  async editWidget(widget: Widget): Promise<void> {
    if (!this.dashboard || !this.dashboard.sectionIds) {
      await this.notifier.error('Cannot edit', 'Cannot edit widget: Dashboard or sections not loaded.');
      return;
    }

    const parentSection = this.dashboard.sectionIds.find((s) =>
      s.widgetIds.some((w) => w._id === widget._id)
    );
    if (!parentSection) {
      await this.notifier.error('Cannot edit', 'Cannot edit widget: Parent section not found.');
      return;
    }

    // CORRECTED COMPONENT NAME:
    const dialogRef = this.dialog.open(WidgetFormDialogComponent, {
      // Changed to WidgetFormDialogComponent
      width: "600px",
      disableClose: true,
      data: {
        dashboard: this.dashboard,
        section: parentSection,
        widget: widget,
      },
    });

   

    dialogRef.afterClosed().subscribe((result) => {
      // If dialog returned a truthy result, refresh dashboard
      if (result !== false && this.dashboard?._id) {
        this.loadDashboard(this.dashboard!._id!);
      }
    });
  }

  /*
    * Deletes a section from the dashboard and updates the widgetSectionList.
    * This method is called when the user confirms deletion of a section.
    */
  async deleteSection(section: Section): Promise<void> {
    if (!this.dashboard || !this.dashboard.sectionIds || !section._id) return;

    const confirmation = await this.notifier.confirmKey('notifications.confirm_delete_section', { title: section.title });

    if (confirmation.isConfirmed) {
      try {
        await this.dashboardBuilderRepository.deleteSection(section._id);

        const index = this.dashboard.sectionIds.findIndex(
          (s) => s._id === section._id
        );

        if (index !== -1) {
          // Create a new dashboard object with updated sectionIds immutably
          this.dashboard = {
            ...this.dashboard,
            sectionIds: [
              ...this.dashboard.sectionIds.slice(0, index),
              ...this.dashboard.sectionIds.slice(index + 1)
            ]
          };

          // Also update the widgetSectionList to reflect the change in the UI
          this.widgetSectionList = [];
          this.selectedTabIndex = 0; // Reset to first tab
        }

        await this.notifier.successKey('notifications.section_deleted');

      } catch (error) {
        console.error("Error deleting section:", error);
        await this.notifier.error('Error', 'Error deleting section. Please try again.');
      }
    }
  }

  /**
   * Deletes a widget from the current section of the dashboard.
   * This method prompts the user for confirmation before deleting.
   * It updates the dashboard's sectionIds to remove the widget
   * and updates the widgetSectionList to reflect the change in the UI.
   * @param widget The widget to delete.
   * @returns void
   */
  async deleteWidget(widget: Widget): Promise<void> {
    if (!this.dashboard || !this.dashboard.sectionIds || !widget._id) return;

    const confirmation = await this.notifier.confirmKey('notifications.confirm_delete_widget', { title: widget.title });
    if (confirmation.isConfirmed) {
      try {
        // First, delete the widget via the repository
        await this.dashboardBuilderRepository.deleteWidget(widget._id);

        // Then, update the local state to reflect the deletion
        const currentSection = this.dashboard.sectionIds[this.selectedTabIndex];
        if (currentSection && currentSection.widgetIds) {
          const index = currentSection.widgetIds.findIndex(
            (w) => w._id === widget._id
          );

          if (index !== -1) {
            // Create a new section object with updated widgetIds immutably
            const updatedSection = {
              ...currentSection,
              widgetIds: [
                ...currentSection.widgetIds.slice(0, index),
                ...currentSection.widgetIds.slice(index + 1)
              ]
            };
            
            // Replace the section in the dashboard's sectionIds array immutably
            this.dashboard = {
              ...this.dashboard,
              sectionIds: this.dashboard.sectionIds.map((section, idx) =>
                idx === this.selectedTabIndex ? updatedSection : section
              )
            };

            // Also update the widgetSectionList to reflect the change in the UI
            this.widgetSectionList = [...updatedSection.widgetIds];
            
            await this.notifier.successKey('notifications.widget_deleted');
          }
        }
      } catch (error) {
        console.error("Error deleting widget:", error);
        await this.notifier.errorKey('notifications.widget_delete_error', { error: error?.message || '' });
      }
    }
  }

  async saveDashboard(): Promise<void> {
    if (!this.dashboard) {
      await this.notifier.toastKey('notifications.no_dashboard_data', 'info', undefined, 3000);
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
        await this.notifier.successKey('notifications.saved');
        // Ensure latest server state is reflected immediately
        await this.loadDashboard(this.dashboard._id);
      } else {
        result = await this.dashboardService.createDashboard(updateInput);
        if (result?._id) {
          this.dashboard._id = result._id;
          this.router.navigate([
            "/admin/dashboard-builder",
            this.dashboard._id,
          ]);
          await this.notifier.successKey('notifications.created');
          await this.loadDashboard(this.dashboard._id);
        } else {
          throw new Error("Failed to get ID for new dashboard.");
        }
      }
    } catch (error) {
      console.error("Error saving dashboard:", error);
      await this.notifier.errorKey('notifications.save_error', { error: error?.message || '' });
    }
  }

  addSection(): void {
    const dialogRef = this.dialog.open(SectionFormDialogComponent, {
      width: "450px",
      disableClose: true,
      data: {
        dashboard: this.dashboard,
        title: "New Section",
        background: "#f5f5f5",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?._id) {
        // Reload dashboard then select and scroll to the newly created section
        this.loadDashboard(this.dashboard!._id!).then(() => {
          // Find the index of the new section
          const newIndex = this.dashboard?.sectionIds?.findIndex(s => s._id === result._id) || 0;
          this.selectedTabIndex = newIndex >= 0 ? newIndex : 0;
          this.onTabChange(this.selectedTabIndex);

          // Wait a tick and then scroll the tab header into view
          setTimeout(() => {
            const selector = `[data-section-id="${result._id}"]`;
            const el = document.querySelector(selector) as HTMLElement | null;
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.focus({ preventScroll: true });
            }
          }, 120);
        });
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
      // Refresh when dialog returns a truthy value (some dialogs return boolean)
      if (result !== false && this.dashboard?._id) {
        this.loadDashboard(this.dashboard!._id!);
      }
    });
  }

  async addWidget(section: Section): Promise<void> {
    if (!this.dashboard || this.isOpeningDialog) {
      if (this.isOpeningDialog) {
        await this.notifier.infoKey('notifications.dialog_opening', undefined, 2000);
      } else {
        await this.notifier.errorKey('notifications.cannot_add_widget');
      }
      return;
    }

    this.isOpeningDialog = true;
    const dialogRef = this.dialog.open(WidgetFormDialogComponent, {
      width: "600px",
      disableClose: true,
      data: {
        dashboard: this.dashboard,
        section: section,
        widget: undefined,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.isOpeningDialog = false;
      // If dialog returned a truthy result, refresh dashboard
      if (result !== false && this.dashboard?._id) {
        this.loadDashboard(this.dashboard!._id!);
      }
    });
  }

  goBack(): void {
    this.router.navigate(["/admin/dashboard-list"]);
  }

  async regenerateAnalysis(): Promise<void> {
    if (!this.dashboard?._id) {
      await this.notifier.errorKey('notifications.no_dashboard_data');
      return;
    }

    try {
      const regenerationResult = await this.dashboardService.regenerateAutoAnalysisDashboard(this.dashboard._id);
      
      if (regenerationResult.includes("up to date")) {
        await this.notifier.successKey('notifications.regenerate_up_to_date');
      } 
      else if (regenerationResult.includes("Estimated time")) {
        const match = regenerationResult.match(/(\d+)\s+(seconds?|minutes?)/i);

        const time = match ? match[1] : "a few";
        const rawUnit = match ? match[2].toLowerCase() : "seconds";
        let unit = rawUnit;

        // Use translation service
        const lang = this.translation.getCurrentLanguage();

        if (lang === 'fr') {
          if (rawUnit.startsWith("second")) {
            unit = time === "1" ? "seconde" : "secondes";
          } else if (rawUnit.startsWith("minute")) {
            unit = time === "1" ? "minute" : "minutes";
          }
        } else {
          // English plural handling
          if (rawUnit.startsWith("second")) {
            unit = time === "1" ? "second" : "seconds";
          } else if (rawUnit.startsWith("minute")) {
            unit = time === "1" ? "minute" : "minutes";
          }
        }

        await this.notifier.successKey('notifications.regenerate_in_progress', { time, unit });
      }

      else {
        await this.notifier.successKey('notifications.regenerate_success');
      }
      
      // Reload the dashboard to reflect changes
      this.loadDashboard(this.dashboard._id);
    } catch (error) {
      console.error('Error regenerating dashboard analysis:', error);
      await this.notifier.errorKey('notifications.regenerate_error');
    }
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

  // Only for PIE 1x1: decide if we show popup link instead of list
  isPieChartOneByOne(widget: Widget): boolean {
    const typeKey = (widget.chartType || '').toLowerCase();
    const isPie = [
      'piechart',
      'pie_chart_broken_down_slices',
      'slicedchart'
    ].includes(typeKey);
    return isPie && Number(widget.columnSize) === 1 && Number(widget.rowSize) === 1;
  }

  // Generic: is widget 1x1
  private isOneByOne(widget: Widget): boolean {
    return Number(widget.columnSize) === 1 && Number(widget.rowSize) === 1;
  }

  // For ALL non-pie charts sized 1x1, use popup like pie 1x1
  isNonPieChartOneByOne(widget: Widget): boolean {
    const typeKey = (widget.chartType || '').toLowerCase();
    const isPie = ['piechart', 'pie_chart_broken_down_slices', 'slicedchart'].includes(typeKey);
    return this.isOneByOne(widget) && !isPie;
  }

  // Extra: detect 2x1 and 1x2 for scroll behavior in builder
  isTwoByOne(widget: Widget): boolean {
    // Treat any wide 1-row tile (2x1, 3x1, 4x1) as 2x1 behavior for scroll
    return Number(widget.rowSize) === 1 && Number(widget.columnSize) >= 2;
  }

  isOneByTwo(widget: Widget): boolean {
    return Number(widget.columnSize) === 1 && Number(widget.rowSize) === 2;
  }

  openDataSourceDialog(widget: Widget): void {
    this.dialog.open(DataSourceQuickInfoDialogComponent, {
      width: '380px',
      maxWidth: '95vw',
      data: { widget }
    });
  }

  openQuickInfo(origin: CdkOverlayOrigin, widget: Widget, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickInfoOrigin = origin;
    this.quickInfoWidget = widget;
    this.quickInfoOpen = true;
  }

  closeQuickInfo(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.quickInfoOpen = false;
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

  // Toggle and read hidden-state for widget info block
  toggleWidgetInfo(widgetId: string): void {
    const current = this.widgetInfoHiddenState.get(widgetId) || false;
    this.widgetInfoHiddenState.set(widgetId, !current);
  }

  isWidgetInfoHidden(widgetId: string): boolean {
    return this.widgetInfoHiddenState.get(widgetId) || false;
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
      
      // Update existing dashboard with modified sections
      const result = await this.dashboardService.updateSection(
        section._id,
        sectionPayload
      );
      
    } catch (error) {
      console.error("Error saving section:", error);
      await this.notifier.error('Error', 'Error saving widget order. Please try again.');
    }
  }

  trackById(index: number, item: any): string {
    return item._id;
  }
}
