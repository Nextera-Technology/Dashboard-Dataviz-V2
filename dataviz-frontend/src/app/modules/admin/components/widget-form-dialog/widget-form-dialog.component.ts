import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog, // Import MatDialog
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { Subscription } from "rxjs";
import { DashboardBuilderService } from "../../pages/dashboard-builder/dashboard-builder.service";
import { ReplaceUnderscoresPipe } from "@dataviz/pipes/replace-underscores/replace-underscores.pipe";
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Import the new chart selection dialog and its data interfaces
import {
  ChartTypeSelectionDialogComponent,
  ChartSelectionDialogData,
  ChartOptionForDialog,
} from "../chart-type-selection-dialog/chart-type-selection-dialog.component";

// Re-using/extending interfaces from dashboard-builder.component.ts for consistency
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
  chartType?: string; // This will store the name string
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
  followUpStage?: EnumSurveyFollowUpStage | null;
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
  source?: string;
  title: string;
  status?: string;
}

// Data passed to the dialog
export interface WidgetConfigData {
  dashboard: Dashboard;
  section: Section;
  widget?: Widget;
}

// Metadata for followUpStage
export enum EnumSurveyFollowUpStage {
  AFTER_FIRST_WAVE = "AFTER_FIRST_WAVE",
  AFTER_SECOND_WAVE = "AFTER_SECOND_WAVE",
  AFTER_THIRD_WAVE = "AFTER_THIRD_WAVE",
  AFTER_FOURTH_WAVE = "AFTER_FOURTH_WAVE",
}

// Metadata for widgetType and widgetSubType
export interface WidgetTypeOption {
  value: string;
  label: string;
  subTypes?: WidgetSubTypeOption[];
}

export interface WidgetSubTypeOption {
  value: string;
  label: string;
}

// New interface for Chart Type options data (Updated to match backend S3 format)
interface ChartTypeOption {
  chartOptions: ChartOptionForDialog[]; // Changed to array of objects
  defaultChart: string; // This is still the name string
  widgetSubType: string | null;
  widgetType: string;
}

@Component({
  selector: "app-widget-form-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    ReplaceUnderscoresPipe,
    TranslatePipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./widget-form-dialog.component.html",
  styleUrl: "./widget-form-dialog.component.scss",
})
export class WidgetFormDialogComponent implements OnInit, OnDestroy {
  widgetForm: FormGroup;
  isEditMode: boolean = false;
  dashboard: Dashboard;
  currentSection: Section;
  currentWidget?: Widget;

  private widgetTypeSubscription?: Subscription;
  private widgetSubTypeSubscription?: Subscription;

  readonly followUpStages = Object.values(EnumSurveyFollowUpStage);

  readonly widgetTypes: WidgetTypeOption[] = [
    {
      value: "FURTHER_STUDIES",
      label: "Further Studies",
      subTypes: [
        { value: "STUDY_RATE", label: "Study Rate" },
        { value: "STUDY_COMPARISON", label: "Study Comparison" },
      ],
    },
    {
      value: "DOMAINS",
      label: "domains",
      subTypes: [
        { value: "DOMAIN_PERCENTAGE", label: "DOMAIN_PERCENTAGE" },
        { value: "DOMAIN_TOP3_COMPARISON", label: "DOMAIN_TOP3_COMPARISON" },
        { value: "DOMAIN_EVOLUTION", label: "DOMAIN_EVOLUTION" },
      ],
    },
    { value: "MANAGER_LEVEL", label: "Manager Level" },
    { value: "SAME_DIFFERENT_SCHOOL", label: "Same/Different School" },
    { value: "PROFESSIONAL_SITUATION", label: "Professional Situation" },
    {
      value: "STATUS_BY_WAVE",
      label: "Status By Wave",
      subTypes: [
        { value: "STATUS_WAVE_BREAKDOWN", label: "Status Wave Breakdown" },
        { value: "STATUS_EVOLUTION", label: "Status Evolution" },
      ],
    },
    {
      value: "POSITIONS_FUNCTIONS",
      label: "Positions Functions",
      subTypes: [
        { value: "TOP_8_POSITIONS", label: "Top 8 Positions" },
        { value: "POSITIONS_EVOLUTION", label: "Positions Evolution" },
        {
          value: "POSITION_TOP3_COMPARISON",
          label: "Position Top 3 Comparison",
        },
      ],
    },
    {
      value: "SALARIES",
      label: "Salaries",
      subTypes: [
        { value: "SALARY_AVERAGE", label: "Salary Average" },
        { value: "SALARY_EVOLUTION", label: "Salary Evolution" },
      ],
    },
    {
      value: "SKILLS",
      label: "Skills",
      subTypes: [
        { value: "TARGETED_JOB_SKILLS", label: "Targeted Job Skills" },
        { value: "NON_TARGETED_JOB_SKILLS", label: "Non-Targeted Job Skills" },
        { value: "OVERALL_COMPETENCIES", label: "Overall Competencies" },
      ],
    },
    { value: "SATISFACTION", label: "Satisfaction" },
    { value: "GRADUATION_SUCCESS", label: "Graduation Success" },
    { value: "SURVEY_COMPLETION", label: "Survey Completion" },
    { value: "SURVEY_DISTRIBUTION", label: "Survey Distribution" },
    {
      value: "COMPANIES",
      label: "Companies",
      subTypes: [
        { value: "TARGETED_COMPANY_SIZE", label: "Targeted Company Size" },
        {
          value: "NON_TARGETED_COMPANY_SIZE",
          label: "Non-Targeted Company Size",
        },
      ],
    },
    { value: "CONTRACT_TYPES", label: "Contract Types" },
    {
      value: "REGION",
      label: "Region",
      subTypes: [
        {
          value: "STUDENT_REGION_DISTRIBUTION",
          label: "Student Region Distribution",
        },
        { value: "REGION_SALARY_AVERAGE", label: "Region Salary Average" },
      ],
    },
    { value: "GENDER", label: "Gender" },
    { value: "EDUCATION_LEVEL_TARGET", label: "Education Level Target" },
    { value: "FLOW", label: "Flow" },
  ];

  filteredSubTypes: WidgetSubTypeOption[] = [];
  maxGridSize = 4; // Max for columnSize and rowSize dropdowns

  allChartTypeOptions: ChartTypeOption[] = []; // Stores all chart type options from backend
  // filteredChartTypes is now an array of ChartOptionForDialog for the dialog
  filteredChartTypes: ChartOptionForDialog[] = [];

  // State to prevent multiple submissions and show spinner
  isSaving = false;

  // Tambahan: Array template background colors yang memastikan kontras baik dengan teks
  templateColors: string[] = [
    '#FFD79A', // Warm peach
    '#FECACA', // Soft coral
    '#FBCFE8', // Light pink
    '#C7F9CC', // Mint green
    '#93C5FD', // Soft blue
    '#FDE68A'  // Warm yellow
  ];

  // Tambahan: Method untuk set background color dari template
  setTemplateColor(color: string): void {
    this.widgetForm.get('background')?.setValue(color);
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<WidgetFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WidgetConfigData,
    private dashboardService: DashboardBuilderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog, // Inject MatDialog for opening new dialogs
    private notifier: NotificationService
  ) {
    this.dashboard = data.dashboard;
    this.currentSection = data.section;
    this.currentWidget = data.widget;

    this.widgetForm = this.fb.group({
      title: [this.currentWidget?.title || "", Validators.required],
      name: [this.currentWidget?.name || "", Validators.required],
      chartType: [this.currentWidget?.chartType || null, Validators.required], // chartType stores the 'name' string
      visible: [
        this.currentWidget?.visible !== undefined
          ? this.currentWidget.visible
          : true,
      ],
      followUpStage: [this.currentWidget?.followUpStage || null, Validators.required],
      widgetType: [this.currentWidget?.widgetType || "", Validators.required],
      widgetSubType: [this.currentWidget?.widgetSubType || null],
      columnSize: [
        this.currentWidget?.columnSize || 1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(this.maxGridSize),
        ],
      ],
      rowSize: [
        this.currentWidget?.rowSize || 1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(this.maxGridSize),
        ],
      ],
      background: [
        this.currentWidget?.background || "#ffffff",
        Validators.required,
      ],
    });
  }

  async ngOnInit(): Promise<void> {
    this.isEditMode = !!this.currentWidget && !!this.currentWidget._id;

    // Fetch all chart options first
    await this.getChartOptions();

    // Set up subscriptions for cascading logic
    this.widgetTypeSubscription = this.widgetForm
      .get("widgetType")
      ?.valueChanges.subscribe(() => this.onWidgetTypeOrSubTypeChange());

    this.widgetSubTypeSubscription = this.widgetForm
      .get("widgetSubType")
      ?.valueChanges.subscribe(() => this.onWidgetTypeOrSubTypeChange());

    // Initial calls to set up filtered sub-types and chart types
    this.onWidgetTypeChange(this.widgetForm.get("widgetType")?.value);
    this.onWidgetTypeOrSubTypeChange(); // Call after initial setup and subscriptions
  }

  ngOnDestroy(): void {
    this.widgetTypeSubscription?.unsubscribe();
    this.widgetSubTypeSubscription?.unsubscribe();
  }

  /**
   * Handles widgetType selection. Updates filteredSubTypes and then triggers
   * onWidgetTypeOrSubTypeChange for chart type filtering.
   * This is called directly from the HTML (selectionChange).
   */
  onWidgetTypeChange(event: Event | string): void {
    const selectedType =
      typeof event === "string"
        ? event
        : (event.target as HTMLSelectElement).value;

    console.log("Selected widget type:", selectedType); // Debug log

    // Find the selected widget type option
    const selectedWidgetTypeOption = this.widgetTypes.find(
      (type) => type.value === selectedType
    );

    // Update filteredSubTypes
    this.filteredSubTypes = selectedWidgetTypeOption?.subTypes || [];
    console.log("Filtered subTypes:", this.filteredSubTypes); // Debug log

    // Reset widgetSubType if current subType is not valid for the new widgetType
    const currentSubType = this.widgetForm.get("widgetSubType")?.value;
    if (
      currentSubType &&
      !this.filteredSubTypes.some((sub) => sub.value === currentSubType)
    ) {
      this.widgetForm.get("widgetSubType")?.setValue(null);
    }

    // Trigger chart type filtering
    this.onWidgetTypeOrSubTypeChange();
  }

  /**
   * Filters chart types based on selected widgetType and widgetSubType.
   * Sets the default chart type if available.
   * Logic: widgetType -> widgetSubType -> chartType
   * OR if widgetSubType doesn't exist: widgetType -> chartType
   */
  onWidgetTypeOrSubTypeChange(): void {
    const selectedWidgetType = this.widgetForm.get("widgetType")?.value;
    const selectedWidgetSubType = this.widgetForm.get("widgetSubType")?.value;

    let matchedChartOptionData: ChartTypeOption | undefined;

    // 1. Try to match with both widgetType and widgetSubType
    if (selectedWidgetType && selectedWidgetSubType) {
      matchedChartOptionData = this.allChartTypeOptions.find(
        (option) =>
          option.widgetType === selectedWidgetType &&
          option.widgetSubType === selectedWidgetSubType
      );
    }

    // 2. If no match with subType, or if widgetSubType is null, try matching only with widgetType
    //    (where chart type data's widgetSubType is explicitly null for that widgetType)
    if (!matchedChartOptionData && selectedWidgetType) {
      matchedChartOptionData = this.allChartTypeOptions.find(
        (option) =>
          option.widgetType === selectedWidgetType &&
          option.widgetSubType === null // Look for chart options that apply to the main widgetType
      );
    }

    // Update filteredChartTypes for the dialog
    this.filteredChartTypes = matchedChartOptionData?.chartOptions || [];

    // Special-case: for FLOW widget type prefer Sankey if available
    if (selectedWidgetType === 'FLOW') {
      const sankeyOption = this.filteredChartTypes.find(c => c.chartType && c.chartType.toLowerCase().includes('sankey'));
      if (sankeyOption) {
        this.widgetForm.get("chartType")?.setValue(sankeyOption.chartType);
        return;
      }
    }

    // Always update the chartType when widgetType or widgetSubType changes.
    // Behavior: prefer configured defaultChart (if present in options), else pick the first available option.
    if (matchedChartOptionData?.defaultChart && this.filteredChartTypes.some((c) => c.chartType === matchedChartOptionData!.defaultChart)) {
      this.widgetForm.get("chartType")?.setValue(matchedChartOptionData.defaultChart);
    } else if (this.filteredChartTypes.length > 0) {
      this.widgetForm.get("chartType")?.setValue(this.filteredChartTypes[0].chartType);
    } else {
      // no valid chart types for this selection
      this.widgetForm.get("chartType")?.setValue(null);
    }
  }

  async getChartOptions(): Promise<void> {
    try {
      const result = await this.dashboardService.getChartOptions();
      if (result?.data?.length) {
        this.allChartTypeOptions = result.data.map((item: any) => ({
          // chartOptions now contains objects { name, s3_file_name }
          chartOptions: item.chartOptions,
          defaultChart: item.defaultChart,
          widgetSubType: item.widgetSubType || null,
          widgetType: item.widgetType,
        }));
        console.log("Loaded all chart type options:", this.allChartTypeOptions);
      }
    } catch (error) {
      console.error("Error loading chart type options:", error);
      await this.notifier.errorKey('notifications.error_loading_dashboard');
    }
  }

  /**
   * Opens the chart type selection dialog.
   */
  async openChartTypeSelection(): Promise<void> {
    if (!this.filteredChartTypes || this.filteredChartTypes.length === 0) {
      await this.notifier.errorKey('notifications.no_chart_types');
      return;
    }

    const dialogRef = this.dialog.open<
      ChartTypeSelectionDialogComponent,
      ChartSelectionDialogData,
      string // Dialog returns the selected chart's name string
    >(ChartTypeSelectionDialogComponent, {
      width: "800px", // Adjust width as needed for the grid
      data: {
        chartOptions: this.filteredChartTypes,
        selectedChartTypeName: this.widgetForm.get("chartType")?.value, // Pass currently selected name for highlight
      },
    });

    dialogRef.afterClosed().subscribe((selectedChartName) => {
      if (selectedChartName) {
        // If a chart was selected (not null/undefined)
        this.widgetForm.get("chartType")?.setValue(selectedChartName);
      }
    });
  }

  /**
   * Handles the form submission. Calls the appropriate save method.
   */
  async onSubmit(): Promise<void> {
    if (this.widgetForm.valid && !this.isSaving) {
      this.isSaving = true;
      try {
        await this._saveWidget();
      } finally {
        this.isSaving = false;
      }
    }
  }

  /**
   * Saves or updates the section by modifying the dashboard object
   * and calling the dashboard service's update method.
   */
  private async _saveWidget(): Promise<void> {
    const formValues = this.widgetForm.value;
    try {
      const numericFormValues = {
        ...formValues,
        columnSize: Number(formValues.columnSize),
        rowSize: Number(formValues.rowSize),
      };

      if (this.isEditMode && this.currentWidget?._id) {
        const widgetPayload = {
          ...numericFormValues,
          dashboardId: this.dashboard?._id,
          sectionId: this.currentSection?._id,
        };
        // Update existing dashboard with modified sections
        const result = await this.dashboardService.updateWidget(
          this.currentWidget?._id,
          widgetPayload
        );
        await this.notifier.successKey('notifications.widget_saved', undefined, 2000);
        this.dialogRef.close(result); // Indicate success
      } else {
        // Add new section
        const widgetPayload = {
          ...numericFormValues,
          dashboardId: this.dashboard?._id,
          sectionId: this.currentSection?._id,
        };

        // Update existing dashboard with modified sections
        const result = await this.dashboardService.createWidget(widgetPayload);
        await this.notifier.successKey('notifications.widget_saved', undefined, 2000);
        this.dialogRef.close(result); // Indicate success
      }
    } catch (error) {
      console.error("Error saving widget:", error);
      await this.notifier.errorKey('notifications.save_error');
      this.dialogRef.close(false); // Indicate failure
    }
  }

  /**
   * Handles the cancel action. Closes the dialog without passing any data.
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Add this function to your class
  getContrastColor(hexColor: string): boolean {
    if (!hexColor || hexColor.length < 7) {
      return false; // Not a valid hex color, default to dark text
    }

    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return true for light text (on dark background), false for dark text (on light background)
    return brightness < 150; // You can adjust this threshold (0-255)
  }

  /**
   * Convert hex color string to `rgb(r, g, b)` format.
   * Returns empty string for invalid input.
   */
  hexToRgbString(hexColor: string | null | undefined): string {
    if (!hexColor) return "";
    let hex = hexColor.trim();
    if (hex[0] === "#") hex = hex.slice(1);
    // Expand shorthand form (#abc -> #aabbcc)
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length !== 6) return "";
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return "";
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Add this getter to your class
  get previewCells(): number[] {
    const columns = this.widgetForm.get("columnSize")?.value || 1;
    const rows = this.widgetForm.get("rowSize")?.value || 1;
    return Array(columns * rows).fill(0); // Create an array for *ngFor
  }

  // Returns the SVG icon string for a given chart type or widget type
  getWidgetIcon(
    chartType: string | null | undefined,
    widgetType: string | null | undefined
  ): string {
    const icons: { [key: string]: string } = {
      // Mapped to 'mat_solid' namespace based on common Material Design icons
      // Chart Types (converted to lowercase for consistent lookup)
      card: "mat_solid:dashboard",
      pie_chart: "mat_solid:pie_chart",
      radial_bar_chart: "mat_solid:data_usage", // Example mapping
      animated_gauge: "mat_solid:speed", // Example mapping
      yes_no_gauge: "mat_solid:check_circle_outline", // Example mapping
      barchart: "mat_solid:bar_chart",
      linechart: "mat_solid:show_chart",
      columnchart: "mat_solid:stacked_bar_chart",
      traceablesankee: "mat_solid:account_tree",
      table: "mat_solid:table_chart",
      text: "mat_solid:text_fields",
      mapchart: "mat_solid:map",
      donut: "mat_solid:donut_large",
      slicedchart: "mat_solid:pie_chart_outline",
      horizontalstackedchart: "mat_solid:stacked_bar_chart",
      verticalstackedchart: "mat_solid:bar_chart",

      // Widget Types (fallback if chartType specific icon is not found, converted to lowercase)
      metric: "mat_solid:analytics",
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
      gender: "mat_solid:wc",
      flow: "mat_solid:device_hub",
    };

    const typeToUse = (chartType || widgetType || "").toLowerCase(); // Prioritize chartType, then widgetType

    // Replace underscores in chartType for lookup if necessary
    const cleanedType = typeToUse.replace(/_/g, "");

    return icons[cleanedType] || icons[typeToUse] || "mat_solid:widgets"; // Default to generic widget icon
  }
}
