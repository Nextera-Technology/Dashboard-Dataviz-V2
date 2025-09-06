import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent"; // For PictorialStackedSeries
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { MatIconModule } from "@angular/material/icon"; // For no-data icon
import { initial } from "lodash";

interface Widget {
  _id?: string;
  chartType?: string; // Should be 'PictorialStackedSeries' for this component
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
  selector: "app-pictorial-fraction-chart",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: "./pictorial-fraction-chart.component.html",
  styleUrl: "./pictorial-fraction-chart.component.scss",
})
export class PictorialStackedChartWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @Input() widget!: Widget;
  @Input() data: any[] | undefined;

  private root!: am5.Root;
  private chart!: am5percent.SlicedChart; // PictorialStackedSeries is typically pushed into a PieChart root

  constructor(private zone: NgZone) {

  }

  // Dynamic height per grid size to compress 1x1 further in builder with scroll
  getChartHeight(): number {
    const col = Number(this.widget?.columnSize ?? 0);
    const row = Number(this.widget?.rowSize ?? 0);
    if (col === 1 && row === 1) return 170;
    if ((col === 2 && row === 1) || (col === 1 && row === 2)) return 220;
    return 300;
  }

  // Check if this is a working days widget
  get isWorkingDaysWidget(): boolean {
    return this.widget?.widgetType === 'JOBDESC_WORKING_DAYS';
  }

  // Get the custom SVG path based on widget type
  getSvgPath(): string {
    if (this.isWorkingDaysWidget) {
      // Custom calendar SVG path for working days
      return 'M531.8 385v483.3h0.1V385h-0.1z M670.9 497.1h86v16h-86z M670.9 625.1h86v16h-86z M233.9 241.1h86v16h-86z M384 241.1h86v16h-86z M233.9 369h86v16h-86z M384 369h86v16h-86z M234 497.5h86v16h-86z M384 497.2h86v16h-86z M398.3 704.4c-11.9-11.9-28.4-19.3-46.5-19.3-36.2 0-65.8 29.6-65.8 65.8v117.4h20V750.9c0-12.2 4.8-23.6 13.5-32.3 8.7-8.7 20.2-13.5 32.3-13.5 12.2 0 23.6 4.8 32.3 13.5 8.7 8.7 13.5 20.2 13.5 32.3v117.4h20V750.9c0-18.1-7.4-34.5-19.3-46.5z M575.8 429v437.9h0.1V429h-0.1z M286.2 868.3h131.6-131.6z M896 868.3V385H575.9V111.6H128v756.7H64v44h896v-44h-64z m-364.1 0H172V155.6h359.9v712.7z m320.1-1.5H575.8V429H852v437.8z';
    }
    // Default SVG path for other widget types
    return 'M38.022,16.348c0,0.807-0.484,1.534-1.229,1.846l-0.771,0.322v4.43c0,0.552-0.447,1-1,1c-0.554,0-1-0.448-1-1v-3.594l-2.312,0.968v5.085c0,0.859-0.554,1.626-1.369,1.896l-10.188,3.386c-0.205,0.068-0.418,0.104-0.632,0.104c-0.192,0-0.389-0.028-0.577-0.085L7.736,27.319c-0.845-0.257-1.423-1.033-1.423-1.915v-5.085l-5.084-2.126C0.486,17.881,0,17.154,0,16.348c0-0.806,0.484-1.534,1.229-1.845L18.24,7.388c0.491-0.206,1.049-0.206,1.543,0l17.01,7.115C37.537,14.813,38.022,15.541,38.022,16.348z';
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  // 👇 This detects changes to inputs
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['widget']) && this.data?.length) {
    setTimeout(() => {
      this.initializeChart();
    }, 0);
  }
    if (changes['widget'] && !changes['widget'].firstChange) {
      this.initializeChart(); // re-render chart on widget update
    }
  }

  initializeChart(): void {

     this.zone.runOutsideAngular(() => {
      if (!this.data || this.data.length === 0) {
        console.warn(
          "PictorialStackedChartWidget: No data provided.",
          this.widget.title
        );
        return;
      }

      if (this.root) {
        this.chart.dispose();
        this.root.dispose();
        console.log("Fraction-Chart : Disposed previous chart instance.");
      }
      const root = am5.Root.new(
      `pictorial-stacked-chart-div-${this.widget._id}`
      );
      // Remove amCharts logo overlay to avoid layout intrusion
      (root as any)._logo && (root as any)._logo.dispose();

      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5percent.SlicedChart.new(root, {
          layout: root.horizontalLayout,
        })
      );

      // Create series
      const series = chart.series.push(
        am5percent.PictorialStackedSeries.new(root, {
          name: "Series",
          orientation: "vertical",
          valueField: "count",
          categoryField: "name",
          svgPath: this.getSvgPath(),
        })
      );

      series.labelsContainer.set("width", 100);
      // Hide ticks to reduce clutter in small tiles
      series.ticks.template.set("visible", false);

      // Configure labels for working days widget
      if (this.isWorkingDaysWidget) {
        series.labels.template.setAll({
          text: "{count} days",
          fontSize: "12px",
          fontWeight: "500",
          fill: am5.color("#374151")
        });
        
        // Configure tooltips for working days
        series.slices.template.setAll({
          tooltipText: "{name}: {count} days"
        });
      } else {
        // Default label configuration for other widget types
        series.labels.template.setAll({
          text: "{name}: {count}"
        });
        
        series.slices.template.setAll({
          tooltipText: "{name}: {count}"
        });
      }

      series.data.setAll(this.data);

      const col = Number(this.widget?.columnSize ?? 0);
      const row = Number(this.widget?.rowSize ?? 0);
      const isSmall = (col === 1 && row === 1) || (col === 2 && row === 1) || (col === 1 && row === 2);
      if (isSmall) {
        series.labels.template.setAll({ fontSize: "9px", maxWidth: 70, oversizedBehavior: "truncate" });
        series.labelsContainer.set("width", 70);
      }

      series.appear(1000, 100);

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
