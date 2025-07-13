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
import { DashboardBuilderService } from "../../pages/dashboard-builder/dashboard-builder.service";

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

// Interface for the data passed into the dialog
export interface SectionFormDialogData {
  dashboard: Dashboard; // The entire dashboard object
  section?: Section; // The specific section to edit (optional, for add mode)
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
    private snackBar: MatSnackBar // Inject snackBar
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
    // Create a deep copy of the dashboard to avoid modifying the original input data directly
    const dashboardToUpdate: Dashboard = JSON.parse(
      JSON.stringify(this.dashboard)
    );

    try {
      if (this.isEditMode && this.currentSection?._id) {
        // Find and update the existing section
        const sectionIndex = dashboardToUpdate.sectionIds.findIndex(
          (s) => s._id === this.currentSection!._id
        );
        if (sectionIndex !== -1) {
          dashboardToUpdate.sectionIds[sectionIndex] = {
            ...dashboardToUpdate.sectionIds[sectionIndex],
            title: formValues.title,
            name: formValues.name,
            background: formValues.background,
          };
        } else {
          throw new Error("Section not found in dashboard for update.");
        }
      } else {
        // Add new section
        const newSection: Section = {
          _id: "temp_" + Date.now().toString(), // Temporary client-side ID for new section
          title: formValues.title,
          name: formValues.name,
          background: formValues.background,
          widgetIds: [], // New sections start with no widgets
          status: "ACTIVE", // Default status for new sections
        };
        dashboardToUpdate.sectionIds.push(newSection);
      }

      // Check if the dashboard itself needs to be created or updated
      if (dashboardToUpdate._id && dashboardToUpdate._id !== "new") {
        // Update existing dashboard with modified sections
        await this.dashboardService.updateDashboard(
          dashboardToUpdate._id,
          dashboardToUpdate
        );
        this.snackBar.open("Section changes saved successfully!", "Close", {
          duration: 3000,
        });
        this.dialogRef.close(true); // Indicate success
      } else {
        // This scenario implies creating a new dashboard that *includes* this section.
        // The dashboard-builder.component is typically responsible for the *initial* creation of a new dashboard.
        // If this dialog is opened for a *new* dashboard (dashboard._id is 'new'),
        // the dialog can't create the dashboard directly with only section data.
        // It must return the section data for the parent to integrate into the new dashboard object
        // before the parent calls createDashboardBuilder for the first time.
        // Given the requirement, we will assume this dialog is always opened for an EXISTING dashboard.
        this.snackBar.open(
          "Dashboard ID missing. Cannot save section directly.",
          "Close",
          { duration: 3000 }
        );
        this.dialogRef.close(false); // Indicate failure
      }
    } catch (error) {
      console.error("Error saving section:", error);
      this.snackBar.open("Failed to save section. Please try again.", "Close", {
        duration: 3000,
      });
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
