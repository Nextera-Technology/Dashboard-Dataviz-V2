import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from "rxjs";
import { DashboardBuilderService } from "../../pages/dashboard-builder/dashboard-builder.service";
import { ReplaceUnderscoresPipe } from "@dataviz/pipes/replace-underscores/replace-underscores.pipe";

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
  AFTER_FIRST_WAVE = 'AFTER_FIRST_WAVE',
  AFTER_SECOND_WAVE = 'AFTER_SECOND_WAVE',
  AFTER_THIRD_WAVE = 'AFTER_THIRD_WAVE',
  AFTER_FOURTH_WAVE = 'AFTER_FOURTH_WAVE',
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

@Component({
  selector: 'app-widget-form-dialog',
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
    ReplaceUnderscoresPipe
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

  readonly followUpStages = Object.values(EnumSurveyFollowUpStage);

  readonly widgetTypes: WidgetTypeOption[] = [
    { value: 'FURTHER_STUDIES', label: 'Further Studies', subTypes: [
      { value: 'STUDY_RATE', label: 'Study Rate' },
      { value: 'STUDY_COMPARISON', label: 'Study Comparison' }
    ]},
    { value: 'DOMAINS', label: 'Domains', subTypes: [
      { value: 'DOMAIN_PERCENTAGE', label: 'Domain Percentage' },
      { value: 'DOMAIN_TOP3_COMPARISON', label: 'Domain Top 3 Comparison' },
      { value: 'DOMAIN_EVOLUTION', label: 'Domain Evolution' }
    ]},
    { value: 'MANAGER_LEVEL', label: 'Manager Level' },
    { value: 'SAME_DIFFERENT_SCHOOL', label: 'Same/Different School' },
    { value: 'PROFESSIONAL_SITUATION', label: 'Professional Situation' },
    { value: 'STATUS_BY_WAVE', label: 'Status By Wave', subTypes: [
      { value: 'STATUS_WAVE_BREAKDOWN', label: 'Status Wave Breakdown' },
      { value: 'STATUS_EVOLUTION', label: 'Status Evolution' }
    ]},
    { value: 'POSITIONS_FUNCTIONS', label: 'Positions Functions', subTypes: [
      { value: 'TOP_8_POSITIONS', label: 'Top 8 Positions' },
      { value: 'POSITIONS_EVOLUTION', label: 'Positions Evolution' },
      { value: 'POSITION_TOP3_COMPARISON', label: 'Position Top 3 Comparison' }
    ]},
    { value: 'SALARIES', label: 'Salaries', subTypes: [
      { value: 'SALARY_AVERAGE', label: 'Salary Average' },
      { value: 'SALARY_EVOLUTION', label: 'Salary Evolution' }
    ]},
    { value: 'SKILLS', label: 'Skills', subTypes: [
      { value: 'TARGETED_JOB_SKILLS', label: 'Targeted Job Skills' },
      { value: 'NON_TARGETED_JOB_SKILLS', label: 'Non-Targeted Job Skills' },
      { value: 'OVERALL_COMPETENCIES', label: 'Overall Competencies' }
    ]},
    { value: 'SATISFACTION', label: 'Satisfaction' },
    { value: 'GRADUATION_SUCCESS', label: 'Graduation Success' },
    { value: 'SURVEY_COMPLETION', label: 'Survey Completion' },
    { value: 'SURVEY_DISTRIBUTION', label: 'Survey Distribution' },
    { value: 'COMPANIES', label: 'Companies', subTypes: [
      { value: 'TARGETED_COMPANY_SIZE', label: 'Targeted Company Size' },
      { value: 'NON_TARGETED_COMPANY_SIZE', label: 'Non-Targeted Company Size' }
    ]},
    { value: 'CONTRACT_TYPES', label: 'Contract Types' },
    { value: 'REGION', label: 'Region', subTypes: [
      { value: 'STUDENT_REGION_DISTRIBUTION', label: 'Student Region Distribution' },
      { value: 'REGION_SALARY_AVERAGE', label: 'Region Salary Average' }
    ]},
    { value: 'GENDER', label: 'Gender' },
    { value: 'EDUCATION_LEVEL_TARGET', label: 'Education Level Target' },
    { value: 'FLOW', label: 'Flow' }
  ];

  filteredSubTypes: WidgetSubTypeOption[] = [];
  maxGridSize = 4; // Max for columnSize and rowSize dropdowns

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<WidgetFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WidgetConfigData,
    private dashboardService: DashboardBuilderService,
    private snackBar: MatSnackBar
  ) {
    this.dashboard = data.dashboard;
    this.currentSection = data.section;
    this.currentWidget = data.widget;

    this.widgetForm = this.fb.group({
      title: [this.currentWidget?.title || '', Validators.required],
      name: [this.currentWidget?.name || '', Validators.required],
      chartType: [this.currentWidget?.chartType || 'card', Validators.required],
      visible: [this.currentWidget?.visible !== undefined ? this.currentWidget.visible : true],
      followUpStage: [this.currentWidget?.followUpStage || null],
      widgetType: [this.currentWidget?.widgetType || '', Validators.required],
      widgetSubType: [this.currentWidget?.widgetSubType || null],
      columnSize: [this.currentWidget?.columnSize || 1, [Validators.required, Validators.min(1), Validators.max(this.maxGridSize)]],
      rowSize: [this.currentWidget?.rowSize || 1, [Validators.required, Validators.min(1), Validators.max(this.maxGridSize)]],
      background: [this.currentWidget?.background || '#ffffff', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.currentWidget && !!this.currentWidget._id;

    this.onWidgetTypeChange(this.widgetForm.get('widgetType')?.value);

    this.widgetTypeSubscription = this.widgetForm.get('widgetType')?.valueChanges.subscribe(selectedType => {
      this.onWidgetTypeChange(selectedType);
    });
  }

  ngOnDestroy(): void {
    this.widgetTypeSubscription?.unsubscribe();
  }

  /**
   * Updates filteredSubTypes based on the selected widgetType.
   * Resets widgetSubType if the new widgetType has no matching subTypes.
   */
  onWidgetTypeChange(selectedType: string): void {
    const selectedWidgetTypeOption = this.widgetTypes.find(type => type.value === selectedType);
    this.filteredSubTypes = selectedWidgetTypeOption?.subTypes || [];

    const currentSubType = this.widgetForm.get('widgetSubType')?.value;
    if (currentSubType && !this.filteredSubTypes.some(sub => sub.value === currentSubType)) {
      this.widgetForm.get('widgetSubType')?.setValue(null);
    }
  }

  /**
   * Handles the form submission. Calls the appropriate save method.
   */
  async onSubmit(): Promise<void> {
    if (this.widgetForm.valid) {
      await this._saveWidget();
    }
  }

  /**
   * Saves or updates the widget by modifying the dashboard object
   * and calling the dashboard service's update method.
   */
  private async _saveWidget(): Promise<void> {
    const formValues = this.widgetForm.value;
    const dashboardToUpdate: Dashboard = JSON.parse(JSON.stringify(this.dashboard));
    const sectionIndex = dashboardToUpdate.sectionIds.findIndex(s => s._id === this.currentSection._id);

    if (sectionIndex === -1) {
      this.snackBar.open("Containing section not found in dashboard.", "Close", { duration: 3000 });
      this.dialogRef.close(false);
      return;
    }

    const targetSection = dashboardToUpdate.sectionIds[sectionIndex];
    if (!targetSection.widgetIds) {
      targetSection.widgetIds = [];
    }

    try {
      if (this.isEditMode && this.currentWidget?._id) {
        const widgetIndex = targetSection.widgetIds.findIndex(
          (w) => w._id === this.currentWidget!._id
        );
        if (widgetIndex !== -1) {
          targetSection.widgetIds[widgetIndex] = {
            ...targetSection.widgetIds[widgetIndex],
            ...formValues,
            _id: this.currentWidget._id,
            data: targetSection.widgetIds[widgetIndex].data || [],
            status: targetSection.widgetIds[widgetIndex].status || 'ACTIVE'
          };
        } else {
          throw new Error("Widget not found in section for update.");
        }
      } else {
        const newWidget: Widget = {
          _id: 'temp_' + Date.now().toString(),
          ...formValues,
          data: [],
          status: "ACTIVE",
        };
        targetSection.widgetIds.push(newWidget);
      }

      if (dashboardToUpdate._id) {
        await this.dashboardService.updateDashboard(
          dashboardToUpdate._id,
          dashboardToUpdate
        );
        this.snackBar.open("Widget saved successfully!", "Close", { duration: 3000 });
        this.dialogRef.close(true);
      } else {
        this.snackBar.open("Dashboard ID missing. Cannot save widget.", "Close", { duration: 3000 });
        this.dialogRef.close(false);
      }

    } catch (error) {
      console.error("Error saving widget:", error);
      this.snackBar.open("Failed to save widget. Please try again.", "Close", { duration: 3000 });
      this.dialogRef.close(false);
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

  // Add this getter to your class
  get previewCells(): number[] {
    const columns = this.widgetForm.get('columnSize')?.value || 1;
    const rows = this.widgetForm.get('rowSize')?.value || 1;
    return Array(columns * rows).fill(0); // Create an array for *ngFor
  }

  // Returns the SVG icon string for a given chart type or widget type
  getWidgetIcon(chartType: string | null | undefined, widgetType: string | null | undefined): string {
    const icons: { [key: string]: string } = {
      // Mapped to 'material-solid' namespace based on common Material Design icons
      // Chart Types
      'card': "material-solid:dashboard",
      'piechart': "material-solid:pie_chart",
      'barchart': "material-solid:bar_chart",
      'linechart': "material-solid:show_chart",
      'columnchart': "material-solid:stacked_bar_chart",
      'traceablesankee': "material-solid:account_tree",
      'table': "material-solid:table_chart",
      'text': "material-solid:text_fields",
      'mapchart': "material-solid:map",
      'donut': "material-solid:donut_large", // Specific icon for donut
      'slicedchart': "material-solid:pie_chart_outline", // Example specific icon
      'horizontalstackedchart': "material-solid:stacked_bar_chart", // Re-using
      'verticalstackedchart': "material-solid:bar_chart", // Re-using

      // Widget Types (fallback if chartType specific icon is not found)
      'metric': "material-solid:analytics",
      'further_studies': 'material-solid:school',
      'domains': 'material-solid:category',
      'education_level_target': 'material-solid:trending_up',
      'same_different_school': 'material-solid:compare_arrows',
      'status_by_wave': 'material-solid:timeline',
      'professional_situation': 'material-solid:work',
      'positions_functions': 'material-solid:people',
      'salaries': 'material-solid:attach_money',
      'skills': 'material-solid:lightbulb',
      'satisfaction': 'material-solid:sentiment_satisfied',
      'graduation_success': 'material-solid:grade',
      'survey_completion': 'material-solid:task_alt',
      'survey_distribution': 'material-solid:poll',
      'manager_level': 'material-solid:supervisor_account',
      'contract_types': 'material-solid:description',
      'companies': 'material-solid:business',
      'region': 'material-solid:public',
      'gender': 'material-solid:wc',
      'flow': 'material-solid:device_hub'
    };

    const typeToUse = (chartType || widgetType || '').toLowerCase(); // Prioritize chartType

    return icons[typeToUse] || "material-solid:widgets"; // Default to generic widget icon
  }
}