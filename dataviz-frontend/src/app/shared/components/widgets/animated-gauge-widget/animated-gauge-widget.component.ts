import { Component, Input, OnInit, AfterViewInit, OnDestroy, NgZone, ElementRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActionsButtonsComponent } from "app/shared/components/actions-buttons/actions-buttons.component";
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface WidgetData { name?: string; count?: number; percentage?: number; totalData?: number; }
interface Widget {
  _id?: string;
  chartType?: string;
  data?: WidgetData[];
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
  selector: "app-animated-gauge-widget",
  standalone: true,
  imports: [CommonModule, ActionsButtonsComponent, TranslatePipe],
  template: `
    <div class="chart-box" [style.background-color]="widget?.background || '#ffffff'">
      <app-actions-buttons [widget]="widget"></app-actions-buttons>
      <div class="chart-content">
        <h3 class="chart-title" *ngIf="!inBuilder">{{ widget.title }}</h3>
        <div class="chart-legend" *ngIf="dataTotal !== null">{{ 'shared.worldMapWidget.students_total_label' | translate }} {{ dataTotal }}</div>
        <div #chartContainer class="gauge-chart"></div>
      </div>
    </div>
  `,
  styles: [`
    .chart-box { position: relative; text-align: center; border-radius: 12px; padding: 16px; transition: all 0.3s ease; min-height: 150px; display: flex; flex-direction: column; height: 100%; }
    .chart-content { flex: 1; display: flex; flex-direction: column; }
    .gauge-chart { flex: 1; width: 100%; min-height: 150px; position: relative }
    .chart-title { font-family: 'Inter'; font-size: 16px; font-weight: 600; color: #00454d; margin: 8px 0; text-align: center }
    .chart-legend { position: absolute; top: 10px; left: 14px; z-index: 2; background: rgba(255, 255, 255, 0.85); padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; color: #15616d; pointer-events: none; text-align: left; }
  `]
})
export class AnimatedGaugeWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() widget!: Widget;
  @Input() inBuilder: boolean = false;
  @Input() data: WidgetData[] | undefined;

  private root?: am5.Root;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  value: number | null = null;
  dataCount: number | null = null;
  dataTotal: number | null = null;
  // references to update on resize
  private chartClockHand: any | null = null;
  private chartLabel: any | null = null;
  private _resizeObserver?: ResizeObserver | null = null;

  // Use ViewChild container instead of id so chart persists when widget properties update
  get chartDivId(): string { return `animated-gauge-div-${this.widget._id}`; }

  constructor(private zone: NgZone) {}
  ngOnInit(): void {
    // determine value
    if(this.data && this.data.length){
      const d = this.data[0];
      this.value = d.percentage ?? d.count ?? null;
      // try to get counts/total for tooltip
      if(d.count !== undefined && d.totalData !== undefined){
        this.dataCount = Number(d.count) || 0;
        this.dataTotal = Number(d.totalData) || 0;
      } else if(d.percentage !== undefined && d.totalData !== undefined){
        this.dataTotal = Number(d.totalData) || 0;
        this.dataCount = Math.round((Number(d.percentage) / 100) * this.dataTotal);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.value === null) return;
    this.zone.runOutsideAngular(() => {
      const root = am5.Root.new(this.chartContainer.nativeElement);
      // remove amCharts branding/logo
      try { root._logo.dispose(); } catch (e) {}
      root.setThemes([am5themes_Animated.new(root)]);

      // Create semicircle radar chart
      const chart = root.container.children.push(am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        startAngle: 180,
        endAngle: 360
      }));

      chart.getNumberFormatter().set("numberFormat", "#'%'");

      const axisRenderer = am5radar.AxisRendererCircular.new(root, {
        innerRadius: -40
      });

      axisRenderer.grid.template.setAll({ stroke: root.interfaceColors.get("background"), visible: true, strokeOpacity: 0.8 });

      const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: axisRenderer
      }));

      // colored ranges
      const colorSet = am5.ColorSet.new(root, {});
      const pct = Math.max(0, Math.min(100, Number(this.value)));
      // compute sizes relative to container
      const sizes = computeGaugeSizesForElement(this.chartContainer?.nativeElement || null);
      const axisRange0 = xAxis.createAxisRange(xAxis.makeDataItem({ above: true, value: 0, endValue: pct }));
      axisRange0.get("axisFill").setAll({ visible: true, fill: colorSet.getIndex(0) });
      axisRange0.get("label").setAll({ forceHidden: true });
      // tooltip for filled range
      const count = this.dataCount ?? null;
      const total = this.dataTotal ?? null;
      if(count !== null && total !== null){
        axisRange0.get("axisFill").setAll({ tooltipText: `${count} / ${total}` });
      } else {
        axisRange0.get("axisFill").setAll({ tooltipText: `${Math.round(pct)}%` });
      }

      const axisRange1 = xAxis.createAxisRange(xAxis.makeDataItem({ above: true, value: pct, endValue: 100 }));
      axisRange1.get("axisFill").setAll({ visible: true, fill: colorSet.getIndex(4) });
      axisRange1.get("label").setAll({ forceHidden: true });

      // clock hand
      const axisDataItem = xAxis.makeDataItem({});

      const clockHand = am5radar.ClockHand.new(root, {
        pinRadius: sizes.pinRadius,
        // make needle reach outer ring (100%) so it aligns with the circle around the percent label
        radius: am5.percent(100),
        // set innerRadius so the needle stops just before the center pin; base it on pinRadius
        innerRadius: sizes.pinRadius,
        bottomWidth: 0,
        topWidth: 0
      });

      clockHand.pin.setAll({ fillOpacity: 0, strokeOpacity: 0.5, stroke: am5.color(0x000000), strokeWidth: 1, strokeDasharray: [2, 2] });
      clockHand.hand.setAll({ fillOpacity: 0, strokeOpacity: 0.5, stroke: am5.color(0x000000), strokeWidth: 0.5 });

      const bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(root, { sprite: clockHand }));
      xAxis.createAxisRange(axisDataItem);

      axisDataItem.set("value", pct);

      // clock hand rotation listener -> update internal label
      const label = chart.radarContainer.children.push(am5.Label.new(root, {
        centerX: am5.percent(50),
        textAlign: "center",
        centerY: am5.percent(50),
        fontSize: sizes.fontSize,
        text: String(Math.round(pct)) + "%"
      }));

      // keep references for resize updates
      this.chartClockHand = clockHand;
      this.chartLabel = label;

      const sprite = bullet.get("sprite") as any;
      sprite.on && sprite.on("rotation", function(){
        const v = axisDataItem.get("value");
        label.set("text", Math.round(v).toString() + "%");
      });

      // animate pointer to value
      axisDataItem.animate({ key: "value", to: pct, duration: 800, easing: am5.ease.out(am5.ease.cubic) });

      chart.appear(1000, 100);
      this.root = root;
      // add ResizeObserver to resize chart when container changes
      if ((window as any).ResizeObserver) {
        const ro = new ResizeObserver(() => {
          try {
            if (this.root) this.root.resize();
            // update sizes dynamically
            const s = computeGaugeSizesForElement(this.chartContainer?.nativeElement || null);
            if (this.chartClockHand) {
              this.chartClockHand.set("pinRadius", s.pinRadius);
              // keep needle full-length so it reaches the surrounding circle
              this.chartClockHand.set("radius", am5.percent(100));
              this.chartClockHand.set("innerRadius", s.pinRadius);
            }
            if (this.chartLabel) {
              this.chartLabel.set("fontSize", s.fontSize);
            }
          } catch(e){}
        });
        ro.observe(this.chartContainer.nativeElement);
        this._resizeObserver = ro;
      }
    });
  }

  ngOnDestroy(): void {
    try {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
    } catch (e) {}
    this.zone.runOutsideAngular(()=>{ if(this.root) this.root.dispose(); });
  }
} 

// compute sizes helper placed outside class to keep file organized
export function computeGaugeSizesForElement(el: HTMLElement | null) {
  if (!el) {
    return { pinRadius: 20, radiusPercent: 100, innerRadius: 40, fontSize: "1.1em" };
  }
  const rect = el.getBoundingClientRect();
  const minDim = Math.min(rect.width, rect.height || 150);
  // scale values based on min dimension
  const scale = Math.max(0.5, Math.min(1.0, minDim / 200));
  return {
    pinRadius: Math.round(20 * scale),
    radiusPercent: Math.round(100 * scale),
    innerRadius: Math.round(40 * scale),
    fontSize: `${(1.1 * scale).toFixed(2)}em`
  };
}