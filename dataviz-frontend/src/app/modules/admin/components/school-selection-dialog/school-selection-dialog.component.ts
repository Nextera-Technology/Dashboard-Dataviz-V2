import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DashboardBuilderRepository } from '@dataviz/repositories/dashboard-builder/dashboard-builder.repository';

export interface SchoolSelectionDialogData {
  dashboardId: string;
  dashboardTitle: string;
}

export interface SchoolSelectionResult {
  openWithAllData: boolean;
  selectedSchools: string[];
}

@Component({
  selector: 'app-school-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="fuse-dialog">
      <!-- Header -->
      <div class="fuse-dialog-header">
        <div class="fuse-dialog-title">
          <div class="flex items-center">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 mr-4">
              <mat-icon class="text-primary-600">dashboard</mat-icon>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">Open Dashboard</h1>
              <p class="text-sm text-gray-500 mt-1">{{ data.dashboardTitle }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <mat-dialog-content class="fuse-dialog-content">
        <div class="space-y-4">
          <!-- Options (unified radio group so clicking card or circle selects) -->
          <mat-radio-group [(ngModel)]="selectedOption" class="w-full">
            <div class="fuse-option-card" [class.selected]="selectedOption === 'all'" (click)="selectedOption = 'all'">
              <div class="flex items-center">
                <mat-radio-button class="mr-4" value="all" aria-label="Open with all school data"></mat-radio-button>
                <div class="flex items-start space-x-4">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                    <mat-icon class="text-blue-600">public</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-base font-medium text-gray-900">Open with all school data</h3>
                    <p class="text-sm text-gray-500 mt-1">View dashboard with complete dataset from all schools</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="fuse-option-card mt-3" [class.selected]="selectedOption === 'selected'" (click)="selectedOption = 'selected'">
              <div class="flex items-center">
                <mat-radio-button class="mr-4" value="selected" aria-label="Open with selected schools"></mat-radio-button>
                <div class="flex items-start space-x-4">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
                    <mat-icon class="text-indigo-600">filter_list</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-base font-medium text-gray-900">Open with selected schools</h3>
                    <p class="text-sm text-gray-500 mt-1">Filter dashboard data by specific schools</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-radio-group>
        </div>

        <!-- School Selection Section -->
        <div class="fuse-school-selection mt-6" *ngIf="selectedOption === 'selected'">
          <div class="flex items-center space-x-3 mb-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
              <mat-icon class="text-gray-600 text-lg">location_city</mat-icon>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Select Schools</h3>
          </div>
          
          <!-- Search Field -->
          <div class="fuse-search-container mb-4" *ngIf="!isLoadingSchools && availableSchools.length > 0">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <mat-icon class="h-5 w-5 text-gray-400">search</mat-icon>
              </div>
              <input type="text"
                     [(ngModel)]="searchTerm"
                     (input)="onSearchChange()"
                     placeholder="Search schools..."
                     class="fuse-search-input block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
            </div>
          </div>
          
          <!-- Schools List -->
          <div class="fuse-schools-container" *ngIf="!isLoadingSchools">
            <div class="fuse-schools-list space-y-2 max-h-64 overflow-y-auto">
              <div class="fuse-school-item" *ngFor="let school of filteredSchools">
                <mat-checkbox 
                  [(ngModel)]="schoolSelections[school]"
                  (change)="onSchoolSelectionChange()"
                  class="fuse-checkbox">
                  <span class="text-sm text-gray-700">{{ school }}</span>
                </mat-checkbox>
              </div>
            </div>
            
            <!-- No Results -->
            <div class="fuse-no-results" *ngIf="filteredSchools.length === 0 && availableSchools.length > 0">
              <div class="flex items-center justify-center space-x-2 py-8 text-gray-500">
                <mat-icon class="text-gray-400">search_off</mat-icon>
                <span class="text-sm">No schools found matching "{{ searchTerm }}"</span>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div class="fuse-loading" *ngIf="isLoadingSchools">
            <div class="flex items-center justify-center space-x-3 py-8">
              <mat-icon class="animate-spin text-primary-600">hourglass_empty</mat-icon>
              <span class="text-sm text-gray-600">Loading available schools...</span>
            </div>
          </div>
          
          <!-- Selection Info -->
          <div class="fuse-selection-info mt-4 p-3 bg-gray-50 rounded-lg" *ngIf="selectedOption === 'selected'">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">{{ getSelectedSchoolsCount() }} school(s) selected</span>
              <div class="flex items-center space-x-1 text-amber-600" *ngIf="getSelectedSchoolsCount() === 0">
                <mat-icon class="text-sm">warning</mat-icon>
                <span class="text-xs">Please select at least one school</span>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions class="fuse-dialog-actions">
        <div class="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50">
          <button mat-stroked-button 
                  (click)="onCancel($event)" 
                  type="button"
                  class="fuse-cancel-button">
            Cancel
          </button>
          <button mat-flat-button 
                  color="primary" 
                  (click)="onConfirm($event)"
                  [disabled]="!isValidSelection()"
                  type="button"
                  class="fuse-confirm-button">
            <mat-icon class="mr-2">open_in_new</mat-icon>
            Open Dashboard
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .fuse-dialog {
      @apply max-w-2xl w-full;
    }

    .fuse-dialog-header {
      @apply px-6 py-6 border-b border-gray-200;
    }

    .fuse-dialog-content {
      @apply px-6 py-6 max-h-96 overflow-y-auto;
    }

    .fuse-option-card {
      @apply border-2 border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm;
    }

    .fuse-option-card.selected {
      @apply border-primary-500 bg-primary-50 shadow-sm;
    }

    .fuse-radio {
      @apply w-full;
    }

    .fuse-school-selection {
      @apply bg-gray-50 border border-gray-200 rounded-xl p-4;
    }

    .fuse-search-input {
      @apply bg-white;
    }

    .fuse-search-input:focus {
      @apply shadow-sm;
    }

    .fuse-schools-container {
      @apply border border-gray-200 rounded-lg bg-white;
    }

    .fuse-schools-list {
      @apply p-3;
    }

    .fuse-school-item {
      @apply py-2 px-3 rounded-md hover:bg-gray-50 transition-colors;
    }

    .fuse-checkbox {
      @apply w-full;
    }

    .fuse-no-results {
      @apply border-t border-gray-100;
    }

    .fuse-loading {
      @apply border border-gray-200 rounded-lg bg-white;
    }

    .fuse-selection-info {
      @apply bg-gray-50 border border-gray-200 rounded-lg p-3;
    }

    .fuse-dialog-actions {
      @apply border-t border-gray-200 bg-gray-50 m-0 p-0;
    }

    .fuse-cancel-button {
      @apply text-gray-600 border-gray-300 hover:bg-gray-100;
    }

    .fuse-confirm-button {
      @apply font-medium;
    }

    .fuse-confirm-button:disabled {
      @apply bg-gray-400 text-white cursor-not-allowed;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class SchoolSelectionDialogComponent implements OnInit {
  selectedOption: 'all' | 'selected' = 'all';
  schoolSelections: { [key: string]: boolean } = {};
  availableSchools: string[] = [];
  filteredSchools: string[] = [];
  searchTerm: string = '';
  isLoadingSchools = false;

  constructor(
    public dialogRef: MatDialogRef<SchoolSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolSelectionDialogData,
    private dashboardRepository: DashboardBuilderRepository
  ) {}

  async ngOnInit() {
    await this.loadAvailableSchools();
  }

  private async loadAvailableSchools() {
    if (!this.data.dashboardId) {
      console.error('Dashboard ID is required to load schools');
      return;
    }

    try {
      this.isLoadingSchools = true;
      const schools = await this.dashboardRepository.getSchoolDropdown(this.data.dashboardId);
      this.availableSchools = schools || [];
      
      // Initialize all schools as unselected
      this.availableSchools.forEach(school => {
        this.schoolSelections[school] = false;
      });
      
      // Initialize filtered schools
      this.filteredSchools = [...this.availableSchools];
    } catch (error) {
      console.error('Failed to load available schools:', error);
      this.availableSchools = [];
    } finally {
      this.isLoadingSchools = false;
    }
  }

  onSearchChange(): void {
    const searchLower = this.searchTerm.toLowerCase().trim();
    if (!searchLower) {
      this.filteredSchools = [...this.availableSchools];
    } else {
      this.filteredSchools = this.availableSchools.filter(school => 
        school.toLowerCase().includes(searchLower)
      );
    }
  }

  onSchoolSelectionChange(): void {
    // This method is called when any school checkbox changes
    // We can add validation logic here if needed
  }

  getSelectedSchoolsCount(): number {
    return Object.values(this.schoolSelections).filter(selected => selected).length;
  }

  getSelectedSchools(): string[] {
    return this.availableSchools.filter(school => this.schoolSelections[school]);
  }

  isValidSelection(): boolean {
    if (this.selectedOption === 'all') {
      return true;
    }
    return this.getSelectedSchoolsCount() > 0;
  }

  onCancel(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.dialogRef.close(null);
  }

  onConfirm(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    let selectedSchools: string[];
    
    if (this.selectedOption === 'all') {
      selectedSchools = ['ALL'];
    } else {
      selectedSchools = Object.keys(this.schoolSelections)
        .filter(school => this.schoolSelections[school]);
    }
    
    const result: SchoolSelectionResult = {
      openWithAllData: this.selectedOption === 'all',
      selectedSchools: selectedSchools
    };
    
    this.dialogRef.close(result);
  }
}
