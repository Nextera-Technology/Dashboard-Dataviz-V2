// src/app/components/widgets/metric-widget/metric-widget.component.ts
import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon"; // Ensure MatIconModule is imported for the template

// Re-using Widget interface (or a minimal version for this component)
interface Widget {
  _id?: string;
  chartType?: string; // Should be 'CARD' for this component
  data?: any[]; // The actual data for the card
  name?: string;
  title: string;
  visible?: boolean;
  widgetType: string;
  widgetSubType?: string | null;
  columnSize: number;
  rowSize: number;
  status?: string;
  background?: string;
  followUpStage?: string | null;
}

@Component({
  selector: "app-metric-widget",
  standalone: true,
  imports: [CommonModule, MatIconModule], // Added MatIconModule
  templateUrl: "./metric-widget.component.html",
  styleUrl: "./metric-widget.component.scss",
})
export class MetricWidgetComponent implements OnInit {
  @Input() widget!: Widget; // The widget configuration
  @Input() data: any[] | undefined; // The actual data for the chart/card

  mainMetric: {
    name?: string;
    value?: number;
    percentage?: number;
    totalData?: number;
  } | null = null;
  hasData: boolean = false;

  constructor() {}

  ngOnInit(): void {
    if (this.data && this.data.length > 0) {
      this.hasData = true;
      const firstDataItem = this.data[0];

      this.mainMetric = {
        name: firstDataItem.name,
        percentage: firstDataItem.percentage,
        value: firstDataItem.count, // Assuming 'count' is the value for some cards
        totalData: firstDataItem.totalData, // Assuming 'totalData' is for denominators
      };
    } else {
      this.hasData = false;
    }
  }
}
