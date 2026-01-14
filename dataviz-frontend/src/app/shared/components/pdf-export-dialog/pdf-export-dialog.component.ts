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
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { TranslationService } from 'app/shared/services/translation/translation.service';
import Swal from 'sweetalert2';

export interface PdfExportDialogData {
  dashboardId: string;
  dashboardTitle: string;
  isEmployabilitySurvey?: boolean; // true for ES dashboards, false for JD dashboards
}

export interface PdfExportResult {
  exportType: 'all_schools' | 'selected_school' | 'no_school' | 'separate_schools_pdf';
  selectedSchools: string[];
}

@Component({
  selector: 'app-pdf-export-dialog',
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
    MatFormFieldModule,
    TranslatePipe
  ],
  template: `
    <div class="fuse-dialog">
      <!-- Header -->
      <div class="fuse-dialog-header">
        <div class="fuse-dialog-title">
          <div class="flex items-center">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 mr-4">
              <mat-icon class="text-primary-600">picture_as_pdf</mat-icon>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ 'shared.export.pdfExportDialog.title' | translate }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ data.dashboardTitle }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <mat-dialog-content class="fuse-dialog-content">
        <div class="space-y-4">
          <!-- Export Options -->
          <mat-radio-group [(ngModel)]="selectedOption" class="w-full">
            
            <!-- Option New: All Dashboard with 1 file each school -->
            <div class="fuse-option-card" [class.selected]="selectedOption === 'separate_schools_pdf'" (click)="selectedOption = 'separate_schools_pdf'">
              <div class="flex items-center">
                <mat-radio-button class="mr-4" value="separate_schools_pdf"></mat-radio-button>
                <div class="flex items-start space-x-4">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50">
                    <mat-icon class="text-purple-600">collections_bookmark</mat-icon>
                  </div>
                  <div>
                    <h3 class="fuse-option-title">{{ 'shared.export.pdfExportDialog.options.separate_schools_pdf.title' | translate }}</h3>
                    <p class="fuse-option-paragraf">{{ 'shared.export.pdfExportDialog.options.separate_schools_pdf.description' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Option 2: Dashboard + Selected School -->
            <div class="fuse-option-card mt-3" [class.selected]="selectedOption === 'selected_school'" (click)="selectedOption = 'selected_school'">
              <div class="flex items-center">
                <mat-radio-button class="mr-4" value="selected_school"></mat-radio-button>
                <div class="flex items-start space-x-4">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
                    <mat-icon class="text-indigo-600">filter_list</mat-icon>
                  </div>
                  <div>
                    <h3 class="fuse-option-title">{{ 'shared.export.pdfExportDialog.options.selected_school.title' | translate }}</h3>
                    <p class="fuse-option-paragraf">{{ 'shared.export.pdfExportDialog.options.selected_school.description' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Option 3: Dashboard Only (No School Filter) -->
            <div class="fuse-option-card mt-3" [class.selected]="selectedOption === 'no_school'" (click)="selectedOption = 'no_school'">
              <div class="flex items-center">
                <mat-radio-button class="mr-4" value="no_school"></mat-radio-button>
                <div class="flex items-start space-x-4">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <mat-icon class="text-green-600">dashboard</mat-icon>
                  </div>
                  <div>
                    <h3 class="fuse-option-title">{{ 'shared.export.pdfExportDialog.options.no_school.title' | translate }}</h3>
                    <p class="fuse-option-paragraf">{{ 'shared.export.pdfExportDialog.options.no_school.description' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-radio-group>
        </div>

        <!-- School Selection Section (only for selected_school option) -->
        <div class="school-selection-section mt-6" *ngIf="selectedOption === 'selected_school'">
          <div class="flex items-center space-x-3 mb-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
              <mat-icon class="text-gray-600 text-lg">location_city</mat-icon>
            </div>
            <h3 class="fuse-option-title">{{ 'shared.export.pdfExportDialog.select_schools_title' | translate }}</h3>
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
                     [placeholder]="'shared.export.pdfExportDialog.search_placeholder' | translate"
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
                  <span class="fuse-option-paragraf">{{ school }}</span>
                </mat-checkbox>
              </div>
            </div>
            
            <!-- No Results -->
            <div class="fuse-no-results" *ngIf="filteredSchools.length === 0 && availableSchools.length > 0">
              <div class="flex items-center justify-center space-x-2 py-8 text-gray-500">
                <mat-icon class="text-gray-400">search_off</mat-icon>
                <span class="text-sm">{{ 'shared.export.pdfExportDialog.no_results' | translate }} "{{ searchTerm }}"</span>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div class="fuse-loading" *ngIf="isLoadingSchools">
            <div class="flex items-center justify-center space-x-3 py-8">
              <mat-icon class="animate-spin text-primary-600">hourglass_empty</mat-icon>
              <span class="text-sm text-gray-600">{{ 'shared.export.pdfExportDialog.loading' | translate }}</span>
            </div>
          </div>
          
          <!-- Selection Info -->
          <div class="fuse-selection-info mt-4 p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">{{ getSelectedSchoolsCount() }} {{ 'shared.export.pdfExportDialog.schools_selected_suffix' | translate }}</span>
              <div class="flex items-center space-x-1 text-amber-600" *ngIf="getSelectedSchoolsCount() === 0">
                <mat-icon class="text-sm">warning</mat-icon>
                <span class="text-xs">{{ 'shared.export.pdfExportDialog.please_select_one' | translate }}</span>
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
            {{ 'shared.export.pdfExportDialog.cancel' | translate }}
          </button>
          <button mat-flat-button 
                  color="primary" 
                  (click)="onConfirm($event)"
                  [disabled]="!isValidSelection()"
                  type="button"
                  class="fuse-confirm-button">
            <mat-icon class="mr-2">picture_as_pdf</mat-icon>
            {{ 'shared.export.pdfExportDialog.export_button' | translate }}
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
      @apply px-6 py-6 max-h-[70vh] overflow-y-auto;
    }

    .fuse-option-card {
      @apply border-2 border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm;
    }

    .fuse-option-card.selected {
      @apply border-primary-500 bg-primary-50 shadow-sm;
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

    .fuse-option-title {
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #1f2937 !important;
      line-height: 1.4 !important;
      font-family: system-ui, -apple-system, sans-serif !important;
    }
    
    .fuse-option-paragraf {
      font-size: 12px !important;
      font-weight: 400 !important;
      color: rgb(84, 93, 107) !important;
      line-height: 1.4 !important;
      font-family: system-ui, -apple-system, sans-serif !important;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    /* Dark theme glassmorphism overrides */
    :host-context(.theme-dark) ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      background: linear-gradient(135deg, rgba(11,17,34,0.95), rgba(6,12,24,0.92)) !important;
      border: 1px solid rgba(255,255,255,0.18) !important;
      box-shadow: 0 22px 46px rgba(2,6,23,0.60) !important;
      color: var(--text-primary) !important;
      backdrop-filter: blur(10px) !important;
    }
    :host-context(.theme-dark) .fuse-dialog-header { border-color: rgba(255,255,255,0.12) !important; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04)) !important; }
    :host-context(.theme-dark) .fuse-dialog-title h1 { color: var(--text-primary) !important; }
    :host-context(.theme-dark) .fuse-dialog-title p { color: var(--text-secondary) !important; }

    :host-context(.theme-dark) .fuse-option-card {
      background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.05)) !important;
      border-color: rgba(255,255,255,0.20) !important;
    }
    :host-context(.theme-dark) .fuse-option-card.selected {
      background: rgba(59,130,246,0.12) !important;
      border-color: rgba(59,130,246,0.65) !important;
    }
    :host-context(.theme-dark) .fuse-option-title { color: var(--text-primary) !important; }
    :host-context(.theme-dark) .fuse-option-paragraf { color: rgba(226,232,240,0.85) !important; }
    :host-context(.theme-dark) .fuse-search-input { background: rgba(255,255,255,0.10) !important; border-color: rgba(255,255,255,0.22) !important; color: var(--text-primary) !important; }
    :host-context(.theme-dark) .fuse-search-input::placeholder { color: rgba(255,255,255,0.70) !important; }
    :host-context(.theme-dark) .fuse-schools-container { background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.05)) !important; border-color: rgba(255,255,255,0.20) !important; }
    :host-context(.theme-dark) .fuse-school-item:hover { background: rgba(255,255,255,0.08) !important; }
    :host-context(.theme-dark) .fuse-dialog-actions { background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04)) !important; border-color: rgba(255,255,255,0.16) !important; }
    :host-context(.theme-dark) .fuse-cancel-button { color: rgba(226,232,240,0.85) !important; border-color: rgba(255,255,255,0.20) !important; }
    :host-context(.theme-dark) .fuse-confirm-button { background: linear-gradient(135deg, #3b82f6, #6366f1) !important; color: #ffffff !important; }
    :host-context(.theme-dark) .fuse-confirm-button[disabled] { background: rgba(148,163,184,0.55) !important; color: #ffffff !important; }

    /* Controls contrast: radio/checkbox/icons */
    :host-context(.theme-dark) ::ng-deep .mat-mdc-radio-button .mdc-label { color: var(--text-primary) !important; }
    :host-context(.theme-dark) ::ng-deep .mat-mdc-radio-button .mdc-radio__outer-circle { border-color: rgba(255,255,255,0.85) !important; }
    :host-context(.theme-dark) ::ng-deep .mat-mdc-radio-button .mdc-radio__inner-circle { border-color: #3b82f6 !important; }
    :host-context(.theme-dark) ::ng-deep .mat-mdc-checkbox .mdc-label { color: var(--text-primary) !important; }
    :host-context(.theme-dark) ::ng-deep .mat-mdc-checkbox .mdc-checkbox__background { border-color: rgba(255,255,255,0.85) !important; }
    :host-context(.theme-dark) ::ng-deep .mat-mdc-checkbox.mat-mdc-checkbox-checked .mdc-checkbox__background { background-color: #3b82f6 !important; border-color: #3b82f6 !important; }
    :host-context(.theme-dark) .fuse-dialog mat-icon { color: rgba(255,255,255,0.92) !important; }

    /* Dark theme: remove light circles behind icons */
    :host-context(.theme-dark) .bg-primary-50,
    :host-context(.theme-dark) .bg-blue-50,
    :host-context(.theme-dark) .bg-indigo-50,
    :host-context(.theme-dark) .bg-purple-50,
    :host-context(.theme-dark) .bg-green-50,
    :host-context(.theme-dark) .bg-gray-100 {
      background: rgba(255,255,255,0.08) !important;
      border: 1px solid rgba(255,255,255,0.16) !important;
    }
    :host-context(.theme-dark) .text-primary-600,
    :host-context(.theme-dark) .text-blue-600,
    :host-context(.theme-dark) .text-indigo-600,
    :host-context(.theme-dark) .text-purple-600,
    :host-context(.theme-dark) .text-green-600,
    :host-context(.theme-dark) .text-gray-600 { color: rgba(255,255,255,0.92) !important; }
  `]
})
export class PdfExportDialogComponent implements OnInit {
  selectedOption: 'all_schools' | 'selected_school' | 'no_school' | 'separate_schools_pdf' = 'separate_schools_pdf';
  schoolSelections: { [key: string]: boolean } = {};
  availableSchools: string[] = [];
  filteredSchools: string[] = [];
  searchTerm: string = '';
  isLoadingSchools = false;

  constructor(
    public dialogRef: MatDialogRef<PdfExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PdfExportDialogData,
    private dashboardRepository: DashboardBuilderRepository,
    private translationService: TranslationService
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
      const schools = await this.dashboardRepository.getSchoolDropdown(
        this.data.dashboardId,
        this.data.isEmployabilitySurvey ?? false // Pass correct dashboard type
      );
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
    // Called when any school checkbox changes
  }

  getSelectedSchoolsCount(): number {
    return Object.values(this.schoolSelections).filter(selected => selected).length;
  }

  getSelectedSchools(): string[] {
    return this.availableSchools.filter(school => this.schoolSelections[school]);
  }

  isValidSelection(): boolean {
    if (this.selectedOption === 'selected_school') {
      return this.getSelectedSchoolsCount() > 0;
    }
    return true; // Other options are always valid
  }

  onCancel(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.dialogRef.close(null);
  }

  async onConfirm(event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (this.selectedOption === 'separate_schools_pdf') {
      try {
        const allSchools = this.availableSchools;
        
        // Call backend API
        const result = await this.dashboardRepository.exportDashboardWithSchoolsPdf(
          this.data.dashboardId,
          allSchools,
          true,
          []
        );

        // Calculate estimation
        const totalPdfs = result.totalPdfs || (allSchools.length + 1);
        const estimationSeconds = totalPdfs * 30; // 30 seconds per PDF
        
        const secondsText = this.translationService.translate('shared.export.pdfExportDialog.seconds');
        const minutesText = this.translationService.translate('shared.export.pdfExportDialog.minutes');

        // Convert to minutes for better display if large number
        const estimationText = estimationSeconds < 60 
          ? `${estimationSeconds} ${secondsText}` 
          : `${Math.ceil(estimationSeconds / 60)} ${minutesText}`;

        const title = this.translationService.translate('shared.export.pdfExportDialog.export_process_title');
        let message = this.translationService.translate('shared.export.pdfExportDialog.export_process_message');
        
        // Manual parameter replacement
        message = message.replace('{{totalPdfs}}', totalPdfs.toString())
                         .replace('{{schoolCount}}', allSchools.length.toString())
                         .replace('{{estimation}}', estimationText);

        await Swal.fire({
          icon: 'info',
          title: title,
          html: message,
          confirmButtonText: 'OK'
        });

        this.dialogRef.close(null);
      } catch (error) {
        console.error('Export failed:', error);
        const currentLang = this.translationService.getCurrentLanguage();
        const isFr = currentLang === 'fr' || currentLang === 'FR';
        
        Swal.fire({
          icon: 'error',
          title: isFr ? 'Erreur' : 'Error',
          text: isFr ? "Échec du démarrage du processus d'exportation" : 'Failed to start export process'
        });
      }
      return;
    }

    let selectedSchools: string[] = [];
    
    // if (this.selectedOption === 'all_schools') {
    //   selectedSchools = ['ALL'];
    // } else 
    if (this.selectedOption === 'selected_school') {
      selectedSchools = this.getSelectedSchools();
    }
    // For 'no_school', selectedSchools remains empty
    
    const result: PdfExportResult = {
      exportType: this.selectedOption,
      selectedSchools: selectedSchools
    };
    
    this.dialogRef.close(result);
  }
}
