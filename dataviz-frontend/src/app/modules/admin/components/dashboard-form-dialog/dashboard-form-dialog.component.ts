import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms'; // Import FormArray, AbstractControl
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardBuilderService } from '../../pages/dashboard-builder/dashboard-builder.service'; // Adjust path if needed
import { Subscription } from 'rxjs';

// Re-using Section interface for consistency
interface Section {
  _id?: string;
  name?: string;
  background?: string;
  title: string;
  widgetIds: any[];
  status?: string;
}

// UPDATED: Dashboard interface to reflect the new 'sources' array structure
interface Dashboard {
  _id?: string;
  name?: string;
  sectionIds?: Section[];
  sources?: { certification: string | null; classes: string[] | null; }[]; // New 'sources' field
  title: string;
  status?: string;
}

// UPDATED: Interface for the structured source data to use 'classes'
interface SourceDataOption {
  certification: string;
  classes?: string[]; // Renamed 'class' to 'classes'
}

// Data passed to the dialog
export interface DashboardFormDialogData {
  dashboard?: Dashboard; // The dashboard to edit, or undefined for new
}

@Component({
  selector: 'app-dashboard-form-dialog',
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
    MatSnackBarModule,
  ],
  templateUrl: './dashboard-form-dialog.component.html',
  styleUrl: './dashboard-form-dialog.component.scss',
})
export class DashboardFormDialogComponent implements OnInit, OnDestroy {
  dashboardForm: FormGroup;
  isEditMode: boolean = false;
  currentDashboard?: Dashboard;

  private certificationSubscriptions: Map<FormGroup, Subscription> = new Map(); // Store subscriptions per source group

  // UPDATED: Structured list of all possible sources based on new data
  readonly allSources: SourceDataOption[] = [
    { certification: "RDC 2021", classes: [] },
    { certification: "RDC 2022", classes: ["Classe 2022", "Classe Excellence 2022"] },
    { certification: "RDC 2023", classes: [] },
    { certification: "RDC 2024", classes: [] },
    { certification: "RDC 2025", classes: [] },
    { certification: "Classe 2022", classes: [] },
    { certification: "Classe Excellence 2022", classes: [] },
    { certification: "CDRH 2022", classes: [] },
    { certification: "CDRH 2023", classes: [] },
    { certification: "CDRH 2024", classes: [] },
    { certification: "CDRH 2025", classes: [] },
    { certification: "CPEB 2021", classes: [] },
    { certification: "CPEB 2022", classes: [] },
    { certification: "CPEB 2023", classes: [] },
    { certification: "CPEB 2024", classes: [] },
    { certification: "CPEB 2025", classes: [] },
  ];

  // Map to store filtered classes for each source FormGroup
  filteredClassesMap: Map<FormGroup, string[]> = new Map();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DashboardFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DashboardFormDialogData,
    private dashboardService: DashboardBuilderService,
    private snackBar: MatSnackBar
  ) {
    this.currentDashboard = data.dashboard;

    this.dashboardForm = this.fb.group({
      name: [this.currentDashboard?.name || '', Validators.required],
      title: [this.currentDashboard?.title || '', Validators.required],
      sourcesFormArray: this.fb.array([]) // Initialize with an empty FormArray
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.currentDashboard && !!this.currentDashboard._id;

    if (this.isEditMode && this.currentDashboard?.sources && this.currentDashboard.sources.length > 0) {
      // Populate sourcesFormArray from existing dashboard sources
      this.currentDashboard.sources.forEach(source => {
        this.addSource(source);
      });
    } else {
      // For new dashboards, add at least one source entry by default
      this.addSource();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all certification subscriptions
    this.certificationSubscriptions.forEach(sub => sub.unsubscribe());
    this.certificationSubscriptions.clear();
  }

  // Getter for easy access to the sources FormArray
  get sourcesFormArray(): FormArray {
    return this.dashboardForm.get('sourcesFormArray') as FormArray;
  }

  /**
   * Creates a new FormGroup for a source entry.
   */
  createSourceFormGroup(certification?: string | null, classes?: string[] | null): FormGroup {
    return this.fb.group({
      certification: [certification || '', Validators.required],
      classes: [classes || []] // Can be an empty array if no classes are selected
    });
  }

  /**
   * Adds a new source FormGroup to the sourcesFormArray.
   */
  addSource(source?: { certification: string | null; classes: string[] | null; }): void {
    const newSourceGroup = this.createSourceFormGroup(source?.certification, source?.classes);
    this.sourcesFormArray.push(newSourceGroup);

    // Initialize filteredClasses for this new source group
    this.updateFilteredClassesForGroup(newSourceGroup, newSourceGroup.get('certification')?.value);

    // Subscribe to certification changes for this specific source group
    const sub = newSourceGroup.get('certification')?.valueChanges.subscribe(selectedCert => {
      this.updateFilteredClassesForGroup(newSourceGroup, selectedCert);
    });
    if (sub) {
      this.certificationSubscriptions.set(newSourceGroup, sub);
    }
  }

  /**
   * Removes a source FormGroup from the sourcesFormArray at the given index.
   */
  removeSource(index: number): void {
    const groupToRemove = this.sourcesFormArray.at(index) as FormGroup;
    this.sourcesFormArray.removeAt(index);

    // Clean up subscription and map entry for the removed group
    const sub = this.certificationSubscriptions.get(groupToRemove);
    if (sub) {
      sub.unsubscribe();
      this.certificationSubscriptions.delete(groupToRemove);
    }
    this.filteredClassesMap.delete(groupToRemove);
  }

  /**
   * Updates the filteredClasses for a specific source FormGroup.
   */
  updateFilteredClassesForGroup(sourceGroup: FormGroup, selectedCert: string): void {
    const selectedSourceOption = this.allSources.find(s => s.certification === selectedCert);
    const classesForThisCert = selectedSourceOption?.classes || [];
    this.filteredClassesMap.set(sourceGroup, classesForThisCert);

    // If current selected classes are not valid for the new certification, reset them
    const currentSelectedClasses = sourceGroup.get('classes')?.value;
    if (currentSelectedClasses && currentSelectedClasses.length > 0) {
      const invalidClasses = currentSelectedClasses.filter((c: string) => !classesForThisCert.includes(c));
      if (invalidClasses.length > 0) {
        sourceGroup.get('classes')?.setValue([]);
      }
    }
  }

  /**
   * Returns the filtered classes array for a given source FormGroup.
   * Used in the template to populate the classes dropdown.
   */
  getFilteredClasses(sourceGroup: FormGroup): string[] {
    return this.filteredClassesMap.get(sourceGroup) || [];
  }

  /**
   * Handles form submission, calling either create or update dashboard service.
   */
  async onSubmit(): Promise<void> {
    // Mark all controls as touched to trigger validation messages
    this.dashboardForm.markAllAsTouched();
    this.sourcesFormArray.controls.forEach(control => control.markAllAsTouched());


    if (this.dashboardForm.invalid) {
      this.snackBar.open("Please fill all required fields correctly.", "Close", { duration: 3000 });
      return;
    }

    const formValues = this.dashboardForm.value;

    // Construct the 'sources' array payload from the FormArray
    const sourcesPayload: { certification: string | null; classes: string[] | null; }[] =
      this.sourcesFormArray.controls.map(control => {
        const sourceGroupValue = control.value;
        return {
          certification: sourceGroupValue.certification,
          classes: (sourceGroupValue.classes && sourceGroupValue.classes.length > 0)
                   ? sourceGroupValue.classes
                   : null // Set to null if no classes are selected
        };
      });

    try {
      if (this.isEditMode && this.currentDashboard?._id) {
        // Update existing dashboard
        const dashboardToUpdate: Dashboard = {
          name: formValues.name,
          title: formValues.title,
          sources: sourcesPayload, // Assign the new sources array
        };

        await this.dashboardService.updateDashboard(
          this.currentDashboard._id,
          dashboardToUpdate
        );
        this.snackBar.open("Dashboard updated successfully!", "Close", { duration: 3000 });
        this.dialogRef.close(true); // Indicate success
      } else {
        // Create new dashboard
        const newDashboard: Dashboard = {
          name: formValues.name,
          title: formValues.title,
          sources: sourcesPayload, // Assign the new sources array
        };

        const result = await this.dashboardService.createDashboard(newDashboard);
        if (result?._id) {
          this.snackBar.open("Dashboard created successfully!", "Close", { duration: 3000 });
          this.dialogRef.close(true); // Indicate success
        } else {
          throw new Error("Failed to get ID for new dashboard.");
        }
      }
    } catch (error) {
      console.error("Error saving dashboard:", error);
      this.snackBar.open("Failed to save dashboard. Please try again.", "Close", { duration: 3000 });
      this.dialogRef.close(false); // Indicate failure
    }
  }

  /**
   * Closes the dialog without saving.
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}