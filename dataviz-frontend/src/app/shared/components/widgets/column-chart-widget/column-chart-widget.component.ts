// src/app/components/widgets/column-chart-widget/column-chart-widget.component.ts
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
  selector: "app-column-chart-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./column-chart-widget.component.html",
  styleUrl: "./column-chart-widget.component.scss",
})
export class ColumnChartWidgetComponent
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
    if (Array.isArray(this.data)) {
      return this.data.reduce((sum: number, item: any) => sum + (item.value ?? item.count ?? 0), 0);
    }
    return 0;
  }

  private root!: am5.Root;
  private chart!: am5xy.XYChart;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      console.debug('ColumnChartWidget: ngAfterViewInit', { widget: this.widget, data: this.data });

      if (!this.data || this.data.length === 0) {
        console.warn("ColumnChartWidget: No data provided.", this.widget?.title, this.widget);
        return;
      }

      // Prepare element id with fallback to avoid duplicate/undefined ids
      const elemId = `column-chart-div-${this.widget && this.widget._id ? this.widget._id : 'temp_' + Math.random().toString(36).substr(2,6)}`;

      // Ensure the target element exists in DOM and has at least a min-height
      const targetEl = document.getElementById(elemId);
      if (!targetEl) {
        console.warn(`ColumnChartWidget: target element not found: ${elemId}`);
        return;
      }

      // Set a sensible min-height if the container is collapsed
      if (!targetEl.style.minHeight) {
        targetEl.style.minHeight = '150px';
      }

      // Normalize incoming data to expected { category, value } shape
      const mappedData = (this.data || []).map((d: any) => {
        return {
          category: d.name ?? d.category ?? d.label ?? 'Unknown',
          value: Number(d.count ?? d.value ?? d.percentage ?? 0),
          totalData: d.totalData
        };
      });

      const root = am5.Root.new(elemId);
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          layout: root.horizontalLayout,
        })
      );

      // Create axes
      const xRenderer = am5xy.AxisRendererX.new(root, {});
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "category",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      xAxis.data.setAll(mappedData);

      const yRenderer = am5xy.AxisRendererY.new(root, {});
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: yRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      // Create series
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: this.widget?.title ?? 'Series',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "category",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryX}: {valueY}",
          }),
        })
      );

      // Ensure bars have explicit fill/stroke so they contrast with tile background
      series.columns.template.setAll({
        fill: am5.color('#15616d'),
        stroke: am5.color('#15616d'),
        fillOpacity: 1,
        strokeOpacity: 1
      });

      // Legend only on larger widgets
      const isSmall = (this.widget?.columnSize ?? 0) <= 2 && (this.widget?.rowSize ?? 0) <= 1;
      if (!isSmall) {
        const legend = chart.children.push(
          am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50),
            y: am5.percent(0),
            layout: root.horizontalLayout
          })
        );
        legend.data.setAll(chart.series.values);
      }

      // Responsive label sizes for small widgets
      if (isSmall) {
        xRenderer.labels.template.setAll({ fontSize: "10px", maxWidth: 80, oversizedBehavior: "truncate" });
        yRenderer.labels.template.setAll({ fontSize: "10px" });
        chart.setAll({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 });
      }

      series.data.setAll(mappedData);

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
