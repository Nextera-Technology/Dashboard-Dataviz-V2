// src/app/components/widgets/pie-chart-widget/pie-chart-widget.component.ts
import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface Widget {
  _id: string;
  title?: string;
  background?: string;
  // ... other properties
}

@Component({
  selector: "app-pie-chart-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./pie-chart-widget.component.html",
  styleUrl: "./pie-chart-widget.component.scss",
})
export class PieChartWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @Input() widget!: Widget;
  @Input() data: any[] | undefined;

  private root: am5.Root | null = null; // Initialize to null
  private chart: am5percent.PieChart | null = null; // Initialize to null

  constructor(private zone: NgZone) {
    console.log(
      `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] Constructor fired.`
    );
  }

  ngOnInit(): void {
    console.log(
      `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngOnInit fired.`
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(
      `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngOnChanges fired. Changes:`,
      changes
    );

    const dataChanged = changes["data"] && this.data && this.data.length > 0;
    const widgetChanged = changes["widget"];

    if (this.root && (dataChanged || (widgetChanged && this.widget?._id))) {
      // If chart exists and data or widget ID changed, dispose first
      console.log(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngOnChanges: Data or widget changed, disposing existing chart.`
      );
      this.disposeChart();
    }

    // Only attempt to create/recreate if data is available and widget has an ID
    if (this.data && this.data.length > 0 && this.widget && this.widget._id) {
      console.log(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngOnChanges: Data available, attempting to create/recreate chart.`
      );
      // Defer creation to ensure DOM is ready and previous disposal is processed
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.createChart();
        }, 0);
      });
    } else if (!this.data || this.data.length === 0) {
      console.warn(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngOnChanges: No data provided, chart will not render.`
      );
      // Ensure disposed if data becomes empty
      this.disposeChart();
    }
  }

  ngAfterViewInit(): void {
    console.log(
      `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngAfterViewInit fired.`
    );
    // Initial chart creation if data is present and it hasn't been created by ngOnChanges already
    // (ngOnChanges might fire before ngAfterViewInit on first load if inputs are available immediately)
    if (
      this.data &&
      this.data.length > 0 &&
      this.widget &&
      this.widget._id &&
      !this.root
    ) {
      console.log(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngAfterViewInit: Initial chart creation.`
      );
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.createChart();
        }, 0);
      });
    } else if (!this.data || this.data.length === 0) {
      console.warn(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngAfterViewInit: No data provided for initial render.`
      );
    }
  }

  private createChart(): void {
    const chartDivId = `pie-chart-div-${this.widget._id}`;
    const chartDiv = document.getElementById(chartDivId);

    console.log(
      `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] createChart called. Target ID: ${chartDivId}. Div exists: ${!!chartDiv}. Current root: ${!!this.root}`
    );

    // If a root already exists, something is out of sync. Dispose defensively.
    if (this.root) {
      console.warn(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] createChart: Root already exists when trying to create. Disposing old one.`
      );
      this.root.dispose();
      this.root = null;
    }

    if (!chartDiv) {
      console.error(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ERROR: Chart div '${chartDivId}' not found for creating chart.`
      );
      return;
    }
    if (!this.widget || !this.widget._id) {
      console.error(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ERROR: Widget ID is missing, cannot create chart.`
      );
      return;
    }

    this.zone.runOutsideAngular(() => {
      console.log(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] --- START am5.Root.new(${chartDivId}) ---`
      );
      try {
        const root = am5.Root.new(chartDivId);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
          am5percent.PieChart.new(root, {
            startAngle: 180,
            endAngle: 360,
            layout: root.verticalLayout,
          })
        );

        const series = chart.series.push(
          am5percent.PieSeries.new(root, {
            startAngle: 180,
            endAngle: 360,
            valueField: "count",
            categoryField: "name",
            alignLabels: false,
          })
        );

        series.slices.template.setAll({
          cornerRadius: 5,
          tooltipText:
            "{name}: {valuePercentTotal.formatNumber('#.#')}% ({count})",
        });

        series.data.setAll(this.data);
        series.appear(1000, 100);

        this.root = root;
        this.chart = chart;
        console.log(
          `[PieChartWidgetComponent-${this.widget._id}] Chart created successfully. Root assigned.`
        );
      } catch (e) {
        console.error(
          `[PieChartWidgetComponent-${this.widget._id}] Error during amCharts creation:`,
          e
        );
      }
      console.log(
        `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] --- END am5.Root.new(${chartDivId}) ---`
      );
    });
  }

  private disposeChart(): void {
    console.log(
      `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] disposeChart called. Current root: ${!!this.root}`
    );
    this.zone.runOutsideAngular(() => {
      if (this.root) {
        try {
          console.log(
            `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] Disposing amCharts Root...`
          );
          this.root.dispose();
          console.log(
            `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] amCharts Root disposed.`
          );
        } catch (e) {
          console.error(
            `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] Error during amCharts disposal:`,
            e
          );
        } finally {
          this.root = null;
          this.chart = null;
        }
      }
    });
  }

  ngOnDestroy(): void {
    console.log(
      `[PieChartWidgetComponent-${this.widget?._id || "NO_ID"}] ngOnDestroy fired. Initiating chart disposal.`
    );
    this.disposeChart();
  }
}
