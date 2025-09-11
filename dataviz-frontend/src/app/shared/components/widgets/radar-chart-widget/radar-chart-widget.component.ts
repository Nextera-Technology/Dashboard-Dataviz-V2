import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActionsButtonsComponent } from "app/shared/components/actions-buttons/actions-buttons.component";
import { TranslatePipe } from "app/shared/pipes/translate.pipe";
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
  imports: [CommonModule, TranslatePipe, ActionsButtonsComponent],
  template: `
    <div class="chart-box" [style.background-color]="widget?.background || '#ffffff'">
      <app-actions-buttons [widget]="widget" [isDashboard]="true"></app-actions-buttons>
      <div class="chart-content">
        <h3 class="chart-title">{{ widget?.title }}</h3>
        <div class="chart-legend" *ngIf="totalData > 0">{{ 'shared.worldMapWidget.students_total_label' | translate }} {{ totalData }}</div>
        <div class="radar-chart-container">
          <div #chartContainer class="radar-chart"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-box { position: relative; border-radius: 12px; padding: 16px; transition: all 0.3s ease; min-height: 150px; display: flex; flex-direction: column; height: 100%; }
    .chart-content { flex: 1; display: flex; flex-direction: column; }
    .radar-chart-container { width: 100%; height: 100%; position: relative; flex: 1 }
    .radar-chart { width: 100%; height: 100%; min-height: 150px; }
    .chart-title { font-family: 'Inter'; font-size: 16px; font-weight: 600; color: #00454d; margin: 8px 0; text-align: center }
    .chart-legend { position: absolute; top: 10px; left: 14px; z-index: 2; background: rgba(255, 255, 255, 0.95); padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; color: #15616d; pointer-events: none; text-align: left; }
  `]
})
export class RadarChartWidgetComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() widget!: Widget;
  @Input() data: any[] | undefined;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

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
  private _resizeObserver?: ResizeObserver | null = null;

  // Using ViewChild container for chart root (prevents issues when DOM rerenders)

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // create chart after view init
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // recreate chart when inputs change (data, widget, background)
    if (changes.data || changes.widget) {
      // if view not initialized yet, createChart will be called in ngAfterViewInit
      if (!this.chartContainer) return;
      this.zone.runOutsideAngular(() => {
        try {
          if (this.root) {
            this.root.dispose();
            this.root = undefined;
            this.chart = undefined;
          }
        } catch (e) {}
        this.createChart();
      });
    }
  }

  private createChart(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.data || this.data.length === 0) {
        console.warn("RadarChartWidget: No data provided.", this.widget?.title);
        return;
      }

      // dispose existing root if present
      try { if (this.root) { this.root.dispose(); } } catch(e){}

      const containerEl = this.chartContainer?.nativeElement;
      if (!containerEl) return;

      const root = am5.Root.new(containerEl);
      try { (root as any)._logo?.dispose(); } catch {}
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5radar.RadarChart.new(root, {
          panX: true,
          panY: false,
          wheelX: "zoomX",
          wheelY: "zoomX",
          innerRadius: am5.percent(10),
        })
      );

      const cursor = chart.set("cursor", am5radar.RadarCursor.new(root, { behavior: "zoomX" }));
      cursor.lineY.set("visible", false);

      const xRenderer = am5radar.AxisRendererCircular.new(root, { minGridDistance: 30 });
      xRenderer.labels.template.setAll({ radius: 10, paddingTop: 5, fontSize: "12px", textType: "adjusted" });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "name",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      }));
      xAxis.data.setAll(this.data);

      const yRenderer = am5radar.AxisRendererRadial.new(root, {});
      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { min: 0, renderer: yRenderer }));

      const series = chart.series.push(am5radar.RadarLineSeries.new(root, {
        name: this.widget?.title,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "name",
        tooltip: am5.Tooltip.new(root, { labelText: "{categoryX}: {valueY}" }),
      }));

      series.strokes.template.setAll({ strokeWidth: 2 });
      series.fills.template.setAll({ visible: true, fillOpacity: 0.2 });
      series.set("tooltipPosition", "pointer");
      series.bullets.push(() => am5.Bullet.new(root, { sprite: am5.Circle.new(root, { radius: 4, fill: series.get("fill"), stroke: series.get("stroke"), strokeWidth: 1 }) }));
      series.data.setAll(this.data);

      series.appear(1000);
      chart.appear(1000, 100);

      this.root = root;
      this.chart = chart;

      // add ResizeObserver to resize chart when container changes
      try {
        if ((window as any).ResizeObserver) {
          if (this._resizeObserver) {
            try { this._resizeObserver.disconnect(); } catch(e){}
          }
          const ro = new ResizeObserver(() => {
            try { if (this.root) this.root.resize(); } catch (e) {}
          });
          ro.observe(containerEl);
          this._resizeObserver = ro;
        }
      } catch (e) {}
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