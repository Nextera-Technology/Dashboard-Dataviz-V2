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
  columnSize?: number;
  rowSize?: number;
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

  get totalData(): number {
    if (!this.data || this.data.length === 0) {
      return 0;
    }
    const first = this.data[0];
    if (first && first.totalData !== undefined) {
      return first.totalData;
    }
    return this.data.reduce((sum: number, item: any) => sum + (item.count ?? 0), 0);
  }

  private root: am5.Root | null = null; // Initialize to null
  private chart: am5percent.PieChart | null = null; // Initialize to null

  constructor(private zone: NgZone) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    const dataChanged = changes["data"] && this.data && this.data.length > 0;
    const widgetChanged = changes["widget"];

    if (this.root && (dataChanged || (widgetChanged && this.widget?._id))) {
      this.disposeChart();
    }

    // Only attempt to create/recreate if data is available and widget has an ID
    if (this.data && this.data.length > 0 && this.widget && this.widget._id) {
      // Defer creation to ensure DOM is ready and previous disposal is processed
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.createChart();
        }, 0);
      });
    } else if (!this.data || this.data.length === 0) {
      // Ensure disposed if data becomes empty
      this.disposeChart();
    }
  }

  ngAfterViewInit(): void {
    // Initial chart creation if data is present and it hasn't been created by ngOnChanges already
    // (ngOnChanges might fire before ngAfterViewInit on first load if inputs are available immediately)
    if (
      this.data &&
      this.data.length > 0 &&
      this.widget &&
      this.widget._id &&
      !this.root
    ) {
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

    // If a root already exists, something is out of sync. Dispose defensively.
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }

    if (!chartDiv) {
      return;
    }
    if (!this.widget || !this.widget._id) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      try {
        const root = am5.Root.new(chartDivId);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
          am5percent.PieChart.new(root, {
            layout: root.horizontalLayout,
            innerRadius: am5.percent(50),
            radius: am5.percent(60)
          })
        );

        const series = chart.series.push(
          am5percent.PieSeries.new(root, {
            valueField: "count",
            categoryField: "name",
            alignLabels: false,
          })
        );

        series.slices.template.setAll({
          cornerRadius: 5,
          shiftRadius: 3,
          tooltipText:
            "{name}: {count} {percentage}%",
        });

        // Format label with integer percentage
        series.labels.template.setAll({
          text: "{name}: {count} {percentage}%",
          fontSize: "12px", // Adjust font size if needed
          maxWidth: 125, // Set maximum width for labels
          oversizedBehavior: "wrap", // Wrap long text
          paddingBottom: 15,
          paddingRight: 10,
          forceHidden: false, // allow hiding if overlap
          radius: 20 // or experiment with am5.percent(80)
        });
        
        series.data.setAll(this.data);
        series.appear(1000, 100);

        this.root = root;
        this.chart = chart;
      } catch (e) {
        console.error(
          `[PieChartWidgetComponent-${this.widget._id}] Error during amCharts creation:`,
          e
        );
      }
    });
  }

  private disposeChart(): void {
    this.zone.runOutsideAngular(() => {
      if (this.root) {
        try {
          this.root.dispose();
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
    this.disposeChart();
  }
}
