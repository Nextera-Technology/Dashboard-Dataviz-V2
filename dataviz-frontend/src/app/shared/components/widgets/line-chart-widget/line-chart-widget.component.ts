// src/app/components/widgets/line-chart-widget/line-chart-widget.component.ts
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

interface Widget {
  /* ... (same Widget interface as above) ... */
}

@Component({
  selector: "app-line-chart-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./line-chart-widget.component.html",
  styleUrl: "./line-chart-widget.component.scss",
})
export class LineChartWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() widget = null;
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

  private root!: am5.Root;
  private chart!: am5xy.XYChart;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.data || this.data.length === 0) {
        console.warn("LineChartWidget: No data provided.", this.widget.title);
        return;
      }

      const root = am5.Root.new(`line-chart-div-${this.widget._id}`);

      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
        })
      );

      // Create axes
      const xRenderer = am5xy.AxisRendererX.new(root, {});

      // Improve readability of long categorical labels
      xRenderer.labels.template.setAll({
        rotation: -45,              // tilt labels
        centerY: am5.p50,
        centerX: am5.p100,
        paddingTop: 10,
        fontSize: "12px",
        maxWidth: 120,
        oversizedBehavior: "truncate", // show ellipsis when text wider than maxWidth
      });
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "name", // Assuming 'category' field
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      xAxis.data.setAll(this.data);

      const yRenderer = am5xy.AxisRendererY.new(root, {});
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: yRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      // Create series
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: this.widget.title,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "count", // Assuming 'value' field
          categoryXField: "name",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryX}: {valueY}",
          }),
        })
      );

      series.data.setAll(this.data);

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
