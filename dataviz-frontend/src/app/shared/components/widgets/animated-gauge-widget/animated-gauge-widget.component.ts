import { Component, Input, OnInit, AfterViewInit, OnDestroy, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
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
  imports: [CommonModule],
  template: `
    <div class="gauge-container">
      <div [id]="chartDivId" class="gauge-chart"></div>
    </div>
  `,
  styles: [`
    .gauge-container { position: relative; width: 100%; height: 100%; }
    .gauge-chart { width: 100%; height: 100%; min-height: 150px; }
    .center-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; font-weight: 700; color: #0d7680; }
  `]
})
export class AnimatedGaugeWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() widget!: Widget;
  @Input() data: WidgetData[] | undefined;

  private root?: am5.Root;
  value: number | null = null;
  dataCount: number | null = null;
  dataTotal: number | null = null;

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
      const root = am5.Root.new(this.chartDivId);
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
        pinRadius: 50,
        radius: am5.percent(100),
        innerRadius: 50,
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
        fontSize: "1.5em",
        text: String(Math.round(pct)) + "%"
      }));

      const sprite = bullet.get("sprite") as any;
      sprite.on && sprite.on("rotation", function(){
        const v = axisDataItem.get("value");
        label.set("text", Math.round(v).toString() + "%");
      });

      // animate pointer to value
      axisDataItem.animate({ key: "value", to: pct, duration: 800, easing: am5.ease.out(am5.ease.cubic) });

      chart.appear(1000, 100);
      this.root = root;
    });
  }

  ngOnDestroy(): void { this.zone.runOutsideAngular(()=>{ if(this.root) this.root.dispose(); }); }
} 