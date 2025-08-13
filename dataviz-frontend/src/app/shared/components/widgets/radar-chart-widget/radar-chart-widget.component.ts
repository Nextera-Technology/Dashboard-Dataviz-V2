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
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface Widget {
  _id?: string;
  chartType?: string;
  data?: any[];
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
  selector: "app-radar-chart-widget",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="radar-chart-container">
      <span class="total-data" *ngIf="totalData > 0">Total Data : {{ totalData }}</span>
      <div [id]="chartDivId" class="radar-chart"></div>
    </div>
  `,
  styles: [`
    .radar-chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .radar-chart {
      width: 100%;
      height: 100%;
      min-height: 150px;
    }
    .total-data {
      position: absolute;
      top: 0;
      left: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #0d7680;
    }
  `]
})
export class RadarChartWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
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

  private root?: am5.Root;
  private chart?: am5radar.RadarChart;

  get chartDivId(): string {
    return `radar-chart-div-${this.widget._id}`;
  }

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.data || this.data.length === 0) {
        console.warn("RadarChartWidget: No data provided.", this.widget.title);
        return;
      }

      const root = am5.Root.new(this.chartDivId);
      root.setThemes([am5themes_Animated.new(root)]);

      // Create chart
      const chart = root.container.children.push(
        am5radar.RadarChart.new(root, {
          panX: false,
          panY: false,
          innerRadius: am5.percent(10),
        })
      );

      // Create axes
      const xRenderer = am5radar.AxisRendererCircular.new(root, { minGridDistance: 30 });
      xRenderer.labels.template.setAll({
        radius: 10,
        paddingTop: 5,
        fontSize: "12px",
        textType: "adjusted",
      });

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          maxDeviation: 0,
          categoryField: "name",
          renderer: xRenderer,
        })
      );
      xAxis.data.setAll(this.data);

      const yRenderer = am5radar.AxisRendererRadial.new(root, {});
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: yRenderer,
        })
      );

      // Create series
      const series = chart.series.push(
        am5radar.RadarLineSeries.new(root, {
          name: this.widget.title,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "count",
          categoryXField: "name",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryX}: {valueY}"
          })
        })
      );
      series.strokes.template.setAll({ strokeWidth: 2 });
      series.data.setAll(this.data);

      series.appear(1000);
      chart.appear(1000, 100);

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