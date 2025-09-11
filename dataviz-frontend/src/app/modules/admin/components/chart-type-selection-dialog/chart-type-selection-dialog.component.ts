import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip"; // For tooltips on chart boxes
import { environment } from "environments/environment";
import { ReplaceUnderscoresPipe } from "@dataviz/pipes/replace-underscores/replace-underscores.pipe";
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { TranslationService } from 'app/shared/services/translation/translation.service';

// Interface for the data passed into this dialog
export interface ChartOptionForDialog {
  chartType: string;
  previewChartImage: string;
}

export interface ChartSelectionDialogData {
  chartOptions: ChartOptionForDialog[];
  selectedChartTypeName?: string | null; // To highlight the currently selected chart
}

@Component({
  selector: "app-chart-type-selection-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule, // Include MatTooltipModule
    ReplaceUnderscoresPipe,
    TranslatePipe
  ],
  templateUrl: "./chart-type-selection-dialog.component.html",
  styleUrl: "./chart-type-selection-dialog.component.scss",
})
export class ChartTypeSelectionDialogComponent implements OnInit {
  // Placeholder for your S3 base URL. You MUST replace this with your actual S3 bucket URL.
  // Example: 'https://your-bucket-name.s3.amazonaws.com/chart-images/'
  s3BaseUrl: string = environment?.imageUrl; // <-- REPLACE THIS!

  constructor(
    private dialogRef: MatDialogRef<ChartTypeSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChartSelectionDialogData,
    private translation: TranslationService
  ) {}

  /**
   * If true, all chart types are selectable (used for testing/developer mode).
   * Set this to true to disable the grayout/lock overlay when selecting chart types.
   */
  allowAllChartTypesForTesting = true;

  // Chart types that should not be shown in the selection dialog
  private bannedChartTypes = new Set<string>([
    'donut',
    'radial',
    'map_choropleth'
  ]);

  ngOnInit(): void {
    // Dialog data is available via this.data
    // Filter out banned chart types right away so templates never render them
    if (this.data && Array.isArray(this.data.chartOptions)) {
      this.data.chartOptions = this.data.chartOptions.filter((opt: any) => !this.isBannedChartType(opt.chartType));
    }
  }

  /**
   * Returns whether the given chart option is selectable.
   * For now (developer mode) only the currently selected/default chart is selectable.
   */
  isChartSelectable(chartOption: ChartOptionForDialog): boolean {
    // Always gray-out stacked chart variants
    if (this.isStackedChart(chartOption?.chartType)) return false;
    if (this.allowAllChartTypesForTesting) return true;
    if (!this.data) return false;
    // If a selectedChartTypeName is provided, allow only that one.
    if (this.data.selectedChartTypeName) {
      return chartOption.chartType === this.data.selectedChartTypeName;
    }
    // Fallback: allow only the first chart option as default
    return this.data.chartOptions && this.data.chartOptions.length > 0 && this.data.chartOptions[0].chartType === chartOption.chartType;
  }

  private isStackedChart(chartTypeName?: string): boolean {
    if (!chartTypeName) return false;
    const normalized = chartTypeName.toLowerCase();
    // match common stacked chart identifiers
    if (normalized.includes('stack') || normalized.includes('stacked')) return true;
    // specific named stacked variants
    if (normalized.includes('horizontal_stacked') || normalized.includes('vertical_stacked')) return true;
    return false;
  }

  private isBannedChartType(chartTypeName?: string): boolean {
    if (!chartTypeName) return false;
    const normalized = chartTypeName.toLowerCase();
    // allow some flexibility in naming (e.g. "radial_bar_chart" contains "radial")
    if (normalized.includes('radial')) return true;
    if (normalized.includes('choropleth') ) return true;
    if (normalized.includes('donut')) return true;
    // Ban plain sankey but allow traceable sankey variants
    if (normalized.includes('sankey') && !(normalized.includes('traceable') || normalized.includes('trace'))) return true;
    return this.bannedChartTypes.has(normalized);
  }

  /**
   * Tooltip text: shows chart name when selectable or disabled message when not.
   */
  getTooltipText(chartOption: ChartOptionForDialog): string {
    if (this.isChartSelectable(chartOption)) {
      return `${chartOption.chartType}`;
    }
    // Use translation key for disabled tooltip
    return this.translation.translate('admin.chartTypeSelection.tooltip.disabled');
  }

  /**
   * Selects a chart type and closes the dialog, returning the selected chart's name.
   * @param chartOption The selected ChartOptionForDialog object.
   */
  onSelect(chartOption: ChartOptionForDialog): void {
    // Prevent selecting disabled chart options
    if (!this.isChartSelectable(chartOption)) {
      return;
    }

    this.dialogRef.close(chartOption.chartType);
  }

  /**
   * Closes the dialog without selecting a chart type.
   */
  onCancel(): void {
    this.dialogRef.close(null); // Or undefined, to indicate no selection
  }

  /**
   * Helper to get the full S3 image URL.
   */
  getFullImageUrl(s3FileName: string): string {
    return `${this.s3BaseUrl}${s3FileName}`;
  }
}