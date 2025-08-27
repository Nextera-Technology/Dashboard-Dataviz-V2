import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"; // Import MatSnackBar
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { DashboardBuilderService } from "../../pages/dashboard-builder/dashboard-builder.service";
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

// Re-using interfaces from dashboard-builder.component.ts for consistency
interface Widget {
  _id?: string;
  chartType?: string;
  data?: any[];
  name?: string;
  title: string;
  visible?: boolean;
  widgetType: string;
  widgetSubType?: string | null;
  columnSize: number;
  rowSize: number;
  status?: string;
  section?: string;
}

interface Section {
  _id?: string;
  name?: string;
  background?: string;
  title: string;
  widgetIds?: Widget[];
  status?: string;
}

interface Dashboard {
  _id?: string;
  name?: string;
  sectionIds?: Section[];
  source?: string;
  title: string;
  status?: string;
}

// Interface for the data passed into the dialog
export interface SectionFormDialogData {
  dashboard: Dashboard; // The entire dashboard object
  section?: Section; // The specific section to edit (optional, for add mode)
}

export interface SectionFormData {
  id?: string;
  title: string;
  name: string;
  background: string;
}

@Component({
  selector: "app-section-form-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule, // Add MatSnackBarModule here
    TranslatePipe,
  ],
  templateUrl: "./section-form-dialog.component.html",
  styleUrl: "./section-form-dialog.component.scss",
})
export class SectionFormDialogComponent implements OnInit {
  sectionForm: FormGroup;
  isEditMode: boolean = false;
  dashboard: Dashboard;
  currentSection?: Section;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SectionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SectionFormDialogData, // Data received from parent component
    private dashboardService: DashboardBuilderService, // Inject service
    private snackBar: MatSnackBar, // Inject snackBar
    private notifier: NotificationService
  ) {
    this.dashboard = data.dashboard;
    this.currentSection = data.section;

    // Initialize the form
    this.sectionForm = this.fb.group({
      title: [this.currentSection?.title || "", Validators.required],
      name: [this.currentSection?.name || "", Validators.required], // Add name field
      background: [
        this.currentSection?.background || "#f5f5f5",
        Validators.required,
      ],
    });
  }

  ngOnInit(): void {
    // Determine if it's edit mode based on the presence of a section object
    this.isEditMode = !!this.currentSection && !!this.currentSection._id;
  }

  /**
   * Handles the form submission. Calls the appropriate save method.
   */
  async onSubmit(): Promise<void> {
    if (this.sectionForm.valid) {
      await this._saveSection();
    }
  }

  /**
   * Saves or updates the section by modifying the dashboard object
   * and calling the dashboard service's update method.
   */
  private async _saveSection(): Promise<void> {
    const formValues = this.sectionForm.value;
    try {
      if (this.isEditMode && this.currentSection?._id) {
        const sectionPayload = {
          title: formValues.title,
          name: formValues.name,
          background: formValues.background,
        };
        // Update existing dashboard with modified sections
        const result = await this.dashboardService.updateSection(
          this.currentSection?._id,
          sectionPayload
        );
        await this.notifier.success('Section saved', 'Section changes saved successfully!');
        this.dialogRef.close(result); // Indicate success
      } else {
        // Add new section
        const newSection = {
          title: formValues.title,
          name: formValues.name,
          dashboardId: this.dashboard?._id,
          background: formValues.background,
        };
        // Update existing dashboard with modified sections
        const result = await this.dashboardService.createSection(newSection);
        await this.notifier.success('Section saved', 'Section changes saved successfully!');
        this.dialogRef.close(result); // Indicate success
      }
    } catch (error) {
      console.error("Error saving section:", error);
      await this.notifier.error('Save failed', 'Failed to save section. Please try again.');
      this.dialogRef.close(false); // Indicate failure
    }
  }

  /**
   * Handles the cancel action. Closes the dialog without passing any data.
   */
  onCancel(): void {
    this.dialogRef.close(false); // Indicate cancel
  }
}
