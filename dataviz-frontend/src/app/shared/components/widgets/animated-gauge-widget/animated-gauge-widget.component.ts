import { Component, Input, OnInit, AfterViewInit, OnDestroy, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
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
      <div class="center-label" *ngIf="value !== null">{{ value }}%</div>
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

  get chartDivId(): string { return `animated-gauge-div-${this.widget._id}`; }

  constructor(private zone: NgZone) {}
  ngOnInit(): void {
    // determine value
    if(this.data && this.data.length){
      const d = this.data[0];
      this.value = d.percentage ?? d.count ?? null;
    }
  }

  ngAfterViewInit(): void {
    if(this.value===null) return;
    this.zone.runOutsideAngular(() => {
      const root = am5.Root.new(this.chartDivId);
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(am5percent.PieChart.new(root,{ innerRadius: am5.percent(80), startAngle: -90, endAngle: 270 }));

      const series = chart.series.push(am5percent.PieSeries.new(root,{ valueField: "value", categoryField: "category", startAngle:-90, endAngle:270 }));
      series.get("colors")!.set("colors", [ am5.color(0x0d7680), am5.color(0xE0E0E0) ]);
      series.slices.template.setAll({ cornerRadius:10, strokeOpacity:0 });
      series.labels.template.set("forceHidden", true);
      series.ticks.template.set("forceHidden", true);
      series.data.setAll([
        { category: "filled", value: this.value },
        { category: "empty", value: 100 - this.value }
      ]);
      series.appear(1000,100);
      this.root = root;
    });
  }

  ngOnDestroy(): void { this.zone.runOutsideAngular(()=>{ if(this.root) this.root.dispose(); }); }
} 