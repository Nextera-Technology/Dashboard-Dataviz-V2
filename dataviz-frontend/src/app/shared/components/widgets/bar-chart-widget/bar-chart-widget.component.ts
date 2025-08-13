// src/app/components/widgets/bar-chart-widget/bar-chart-widget.component.ts
import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// Re-using Widget interface
interface Widget {
  _id?: string;
  chartType?: string; // e.g., 'BarChart'
  data?: any[]; // Array of data objects for the chart
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
  selector: "app-bar-chart-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./bar-chart-widget.component.html",
  styleUrl: "./bar-chart-widget.component.scss",
})
export class BarChartWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() widget!: Widget;
  @Input() data: any[] | undefined;

  // Computed total data for overlay
  get totalData(): number {
    if (!this.data || this.data.length === 0) {
      return 0;
    }
    // If totalData field exists in first item, use it; otherwise use length or sum
    const first = this.data[0];
    if (first && first.totalData !== undefined) {
      return first.totalData;
    }
    // Fallback: sum of count fields if present
    return this.data.reduce((sum: number, item: any) => sum + (item.count ?? 0), 0);
  }

  private root!: am5.Root;
  private chart!: am5xy.XYChart;

  constructor(private zone: NgZone) {
    console.log("BarChartWidgetComponent initialized");
  }

  ngOnInit(): void {
    // Data processing or initial setup can happen here
    console.log("BarChartWidget initialized with data:", this.data);
  }

  ngAfterViewInit(): void {
    // Sort data if chartType indicates a sorted bar chart
    if (this.widget.chartType && this.widget.chartType.toLowerCase().includes('sorted')) {
      if (this.data) {
        this.data = [...this.data].sort((a: any, b: any) => (b.count ?? 0) - (a.count ?? 0));
      }
    }
    // Chart code goes in a timeout to make sure that the DOM is ready
    this.zone.runOutsideAngular(() => {
      if (!this.data || this.data.length === 0) {
        console.warn("BarChartWidget: No data provided.", this.widget.title);
        return; // Don't initialize chart if no data
      }

      const root = am5.Root.new(`bar-chart-div-${this.widget._id}`); // Unique ID for each chart

      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          layout: root.verticalLayout, // Use vertical layout for bars if desired, or horizontal if categories are vertical
        })
      );

      // Create axes
      const yRenderer = am5xy.AxisRendererY.new(root, {});

      // Prevent long category names from overlapping by truncating with ellipsis
      yRenderer.labels.template.setAll({
        maxWidth: 140,
        oversizedBehavior: "truncate",
        fontSize: "12px",
      });
      const yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "name", // Assuming a 'category' field in your data
          renderer: yRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      yAxis.data.setAll(this.data); // Set category data

      const xRenderer = am5xy.AxisRendererX.new(root, {});
      const xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      // Create series
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: this.widget.title,
          xAxis: xAxis,
          yAxis: yAxis,
          valueXField: "count", // Assuming a 'value' field in your data
          categoryYField: "name",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryY}: {valueX}",
          }),
        })
      );

      series.data.setAll(this.data); // Set chart data

      // Responsive label density for small widgets
      const isSmall = (this.widget?.columnSize ?? 0) <= 2 && (this.widget?.rowSize ?? 0) <= 1;
      if (isSmall) {
        yRenderer.labels.template.setAll({ fontSize: "10px", maxWidth: 80, oversizedBehavior: "truncate" });
        xRenderer.labels.template.setAll({ fontSize: "10px" });
        chart.setAll({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 });
      }

      // Make stuff animate on load
      series.appear(1000);
      chart.appear(1000, 100);

      // Add cursor
      chart.set("cursor", am5xy.XYCursor.new(root, {}));

      this.root = root;
      this.chart = chart;
    });
  }
  

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }
}
