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
    ReplaceUnderscoresPipe
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
    @Inject(MAT_DIALOG_DATA) public data: ChartSelectionDialogData
  ) {}

  ngOnInit(): void {
    // Dialog data is available via this.data
  }

  /**
   * Selects a chart type and closes the dialog, returning the selected chart's name.
   * @param chartOption The selected ChartOptionForDialog object.
   */
  onSelect(chartOption: ChartOptionForDialog): void {
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
