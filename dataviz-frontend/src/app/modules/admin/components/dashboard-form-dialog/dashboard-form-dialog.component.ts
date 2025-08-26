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
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { DashboardBuilderService } from '../../pages/dashboard-builder/dashboard-builder.service'; // Adjust path if needed
import { Subscription } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule,
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

  // Keep track of the certification/title selected for the first source
  private firstSourceCertification: string | null = null;

  dashboardTemplates: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DashboardFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DashboardFormDialogData,
    private dashboardService: DashboardBuilderService,
    private snackBar: MatSnackBar,
    private notifier: NotificationService
  ) {
    this.currentDashboard = data.dashboard;

    this.dashboardForm = this.fb.group({
      name: [this.currentDashboard?.name || '', Validators.required],
      title: [this.currentDashboard?.title || '', Validators.required],
      sourcesFormArray: this.fb.array([]),
      duplicateEnabled: [false],
      duplicateType: ['LIVE'],
      templateId: [''],
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.currentDashboard && !!this.currentDashboard._id;

    if (this.isEditMode && this.currentDashboard?.sources && this.currentDashboard.sources.length > 0) {
      // Populate sourcesFormArray from existing dashboard sources
      this.currentDashboard.sources.forEach(source => {
        this.addSource(source);
      });
      // After populating, set reference to the first source certification
      if (this.sourcesFormArray.length > 0) {
        const firstGroup = this.sourcesFormArray.at(0) as FormGroup;
        this.firstSourceCertification = firstGroup.get('certification')?.value || null;
        this.refreshAllFilteredClasses();
      }
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

      const currentIndex = this.sourcesFormArray.controls.indexOf(newSourceGroup);

      // If this is the first group (index 0), update the reference certification and refresh others
      if (currentIndex === 0) {
        this.firstSourceCertification = selectedCert || null;
        this.refreshAllFilteredClasses();
      } else {
        // For other groups, enforce the certification to match the first if set
        if (this.firstSourceCertification) {
          if (selectedCert && selectedCert !== this.firstSourceCertification) {
            // Reset to the allowed certification without emitting event to avoid loops
            if (newSourceGroup.get('certification')?.value !== this.firstSourceCertification) {
              newSourceGroup.get('certification')?.setValue(this.firstSourceCertification, { emitEvent: false });
            }
          }
        }
      }
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

    // If we removed the first source, clear firstSourceCertification and re-evaluate
    if (index === 0) {
      this.firstSourceCertification = null;
      // If there are still sources, set the first one as the reference
      if (this.sourcesFormArray.length > 0) {
        const newFirst = this.sourcesFormArray.at(0) as FormGroup;
        this.firstSourceCertification = newFirst.get('certification')?.value || null;
      }
      this.refreshAllFilteredClasses();
    }
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
   * Refresh filtered classes for all source groups, used after changes to the first source.
   */
  refreshAllFilteredClasses(): void {
    this.sourcesFormArray.controls.forEach(control => {
      const group = control as FormGroup;
      const cert = group.get('certification')?.value;
      // If a firstSourceCertification is set, enforce it on all groups
      if (this.firstSourceCertification) {
        if (cert !== this.firstSourceCertification) {
          group.get('certification')?.setValue(this.firstSourceCertification, { emitEvent: false });
        }
      }
      const selectedSourceOption = this.allSources.find(s => s.certification === group.get('certification')?.value);
      const classesForThisCert = selectedSourceOption?.classes || [];
      this.filteredClassesMap.set(group, classesForThisCert);
      // Reset classes if invalid
      const currentSelectedClasses = group.get('classes')?.value;
      if (currentSelectedClasses && currentSelectedClasses.length > 0) {
        const invalidClasses = currentSelectedClasses.filter((c: string) => !classesForThisCert.includes(c));
        if (invalidClasses.length > 0) {
          group.get('classes')?.setValue([]);
        }
      }
    });
  }

  /**
   * Returns the filtered classes array for a given source FormGroup.
   * Used in the template to populate the classes dropdown.
   */
  getFilteredClasses(sourceGroup: FormGroup): string[] {
    return this.filteredClassesMap.get(sourceGroup) || [];
  }

  async loadTemplates() {
    const type = this.dashboardForm.get('duplicateType')?.value;
    try {
      this.dashboardTemplates = await this.dashboardService.getDashboardTemplates(type);
    } catch (error) {
      await this.notifier.error('Error', 'Error loading templates');
    }
  }

  /**
   * Handles form submission, calling either create or update dashboard service.
   */
  async onSubmit(): Promise<void> {
    // Mark all controls as touched to trigger validation messages
    this.dashboardForm.markAllAsTouched();
    this.sourcesFormArray.controls.forEach(control => control.markAllAsTouched());


    if (this.dashboardForm.invalid) {
      await this.notifier.error('Validation', 'Please fill all required fields correctly.');
      return;
    }

    const formValue = this.dashboardForm.value;

    // Construct the 'sources' array payload from the FormArray
    const sources = formValue.sourcesFormArray.map((source: any) => ({
      certification: source.certification,
      classes: source.classes || [],
    }));

    if (formValue.duplicateEnabled) {
      if (!formValue.templateId) {
        await this.notifier.error('Validation', 'Please select a template');
        return;
      }

      const duplicateInput = {
        dashboardOriginId: formValue.templateId,
        name: formValue.name,
        title: formValue.title,
        sources,
      };

      try {
        // Debug: inspect payload
        console.debug('Duplicate dashboard input:', duplicateInput);
        const result = await this.dashboardService.duplicateDashboardFromOther(duplicateInput);
        console.debug('Duplicate result:', result);
        await this.notifier.success('Dashboard duplicated', result?.message || 'Dashboard duplicated successfully');
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error duplicating dashboard:', error);
        await this.notifier.error('Duplication failed', error?.message || 'Failed to duplicate dashboard. Please try again.');
        // Do NOT refresh; keep dialog open for user to retry or cancel
      }
    } else {
      // NOTE: Do NOT include `status` and `sectionIds` in the create payload because
      // the GraphQL `CreateDashboardInput` does not accept those fields.
      const dashboardInput: any = {
        name: formValue.name,
        title: formValue.title,
        sources,
      };

      try {
        let result;
        if (this.isEditMode && this.currentDashboard?._id) {
          // Prepare update payload with fields allowed by UpdateDashboardInput (omit status/sectionIds)
          const updateInput: any = {
            name: formValue.name,
            title: formValue.title,
            sources,
          };
          result = await this.dashboardService.updateDashboard(this.currentDashboard._id, updateInput);
        } else {
          result = await this.dashboardService.createDashboard(dashboardInput);
        }
        await this.notifier.success(this.isEditMode ? 'Dashboard updated' : 'Dashboard created', result?.message || (this.isEditMode ? 'Dashboard updated successfully' : 'Dashboard created successfully'));
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error saving dashboard:', error);
        await this.notifier.error('Save failed', error?.message || 'Failed to save dashboard. Please try again.');
        // Do NOT refresh; keep dialog open for user to fix inputs or retry
      }
    }
  }

  /**
   * Closes the dialog without saving.
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}