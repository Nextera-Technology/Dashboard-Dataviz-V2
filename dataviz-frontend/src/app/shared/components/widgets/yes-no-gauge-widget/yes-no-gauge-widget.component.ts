import { Component, Input, OnInit, AfterViewInit, OnDestroy, NgZone, ElementRef, ViewChild, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActionsButtonsComponent } from "app/shared/components/actions-buttons/actions-buttons.component";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface WidgetData { name?: string; count?: number; percentage?: number; totalData?: number; }
interface Widget {
  _id?: string;
  chartType?: string;
  data?: WidgetData[];
  title: string;
  widgetType: string;
  columnSize: number;
  rowSize: number;
  background: string;
}

@Component({
  selector: "app-yes-no-gauge-widget",
  standalone: true,
  imports: [CommonModule, ActionsButtonsComponent],
  template: `
    <div class="chart-box" [style.background-color]="widget?.background || '#ffffff'">
      <app-actions-buttons [widget]="widget"></app-actions-buttons>
      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>
        <div #chartContainer class="gauge-chart">
          <div class="percent-below" *ngIf="yesPct!==null" [ngStyle]="{ color: (yesPct >= 50 ? '#4caf50' : '#f44336') }">{{ yesPct }}%</div>
        </div>
      </div>
    </div>
  `,
  styles:[`
    .chart-box{height:100%;position:relative;border-radius:12px;padding:16px;display:flex;flex-direction:column;}
    .chart-content{flex:1;display:flex;flex-direction:column;position:relative}
    .gauge-chart{width:100%;flex:1;min-height:150px;display:flex;align-items:center;justify-content:center;background:transparent;position:relative}
    /* Position percentage relative to chart center so it stays just under the needle
       Use percentage top so it scales with container size */
    .percent-below{position:absolute;left:50%;top:12%;transform:translateX(-50%);font-size:20px;font-weight:700;white-space:nowrap;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis}
    .chart-title{font-size:16px;font-weight:600;color:#00454d;margin:8px 0;text-align:center;width:100%;position:relative;z-index:2}
  `]
})
export class YesNoGaugeWidgetComponent implements OnInit,AfterViewInit,OnDestroy,OnChanges{
  @Input() widget!:Widget;
  @Input() data:WidgetData[]|undefined;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  yesPct:number|null=null;
  yesCount:number=0;
  noCount:number=0;
  totalCount:number=0;
  private root?:am5.Root;
  private _resizeObserver?: ResizeObserver | null = null;
  // guard if widget or id missing
  // Using ViewChild to target the container element directly prevents
  // issues when widget ids change (e.g. when editing background in builder).
  constructor(private zone:NgZone){}
  ngOnInit(){
    // Robust parsing of possible input shapes from backend or test data.
    if(!this.data || this.data.length === 0){
      this.yesPct = null;
      return;
    }

    const first = this.data[0];
    const second = this.data[1];

    // 1) prefer explicit percentage on first item
    if(first.percentage !== undefined && first.percentage !== null && !Number.isNaN(Number(first.percentage))){
      this.yesPct = Math.max(0, Math.min(100, Math.round(Number(first.percentage))));
      // try to derive counts if possible
      this.yesCount = Number(first.count) || (first.totalData ? Math.round((Number(first.percentage) / 100) * Number(first.totalData)) : 0);
      this.totalCount = Number(first.totalData) || (this.yesCount + (Number(second?.count) || 0));
      this.noCount = Number(second?.count) || Math.max(0, this.totalCount - this.yesCount);
      return;
    }

    // 2) if counts + totalData available on first item
    if(first.count !== undefined && first.count !== null && first.totalData !== undefined && first.totalData){
      this.yesPct = Math.round((Number(first.count) / Number(first.totalData)) * 100);
      this.yesCount = Number(first.count) || 0;
      this.totalCount = Number(first.totalData) || this.yesCount;
      this.noCount = Math.max(0, this.totalCount - this.yesCount);
      return;
    }

    // 3) if two-item array with counts compute from both
    if(second && (first.count !== undefined || second.count !== undefined)){
      const yes = Number(first.count) || 0;
      const no = Number(second.count) || 0;
      const total = yes + no;
      this.yesPct = total ? Math.round((yes / total) * 100) : null;
      this.yesCount = yes;
      this.noCount = no;
      this.totalCount = total;
      return;
    }

    // 4) fallback: if only first.count available and second missing but totalData present on first
    if(first.count !== undefined && first.count !== null && first.totalData){
      this.yesPct = Math.round((Number(first.count) / Number(first.totalData)) * 100);
      this.yesCount = Number(first.count) || 0;
      this.totalCount = Number(first.totalData) || this.yesCount;
      this.noCount = Math.max(0, this.totalCount - this.yesCount);
      return;
    }

    this.yesPct = null;
  }
  ngOnChanges(changes: SimpleChanges){
    // If data or widget properties changed after initial render (e.g., background edited in builder)
    // recreate the chart so it remains visible and consistent.
    if((changes['data'] || changes['widget']) && this.root){
      try{ this.zone.runOutsideAngular(()=>{ if(this.root) this.root.dispose(); this.root = undefined; }); }catch(e){}
      // attempt to re-initialize chart when data present
      if(this.yesPct !== null){
        // run create logic similar to ngAfterViewInit
        setTimeout(()=>{ try{ this.ngAfterViewInit(); }catch(e){} }, 50);
      }
    }
  }
  ngAfterViewInit(){
    if(this.yesPct===null) return;
    this.zone.runOutsideAngular(()=>{
      const root = am5.Root.new(this.chartContainer.nativeElement);
      // remove amCharts branding/logo
      try { root._logo.dispose(); } catch (e) {}
      root.setThemes([am5themes_Animated.new(root)]);

      // Create semicircle radar chart (gauge-like)
      const chart = root.container.children.push(am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        startAngle: 180,
        endAngle: 360
      }));

      // Axis renderer
      const axisRenderer = am5radar.AxisRendererCircular.new(root, {
        innerRadius: -30,
        strokeOpacity: 0.1
      });
      axisRenderer.labels.template.set("forceHidden", true);
      axisRenderer.grid.template.set("forceHidden", true);

      const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        max: 1,
        strictMinMax: true,
        renderer: axisRenderer
      }));

      // YES range (0..0.5)
      const yesDataItem = xAxis.makeDataItem({});
      yesDataItem.set("value", 0);
      yesDataItem.set("endValue", 0.5);
      xAxis.createAxisRange(yesDataItem);
      yesDataItem.get("label").setAll({ text: "YES", forceHidden: false });
      yesDataItem.get("axisFill").setAll({ visible: true, fillOpacity: 1, fill: am5.color(0x4caf50) });
      // Tooltip for YES range
      const yesCount = this.yesCount || 0;
      const total = this.totalCount || (yesCount + (this.noCount || 0));
      yesDataItem.get("axisFill").setAll({ tooltipText: `${yesCount} / ${total}` });

      // NO range (0.5..1)
      const noDataItem = xAxis.makeDataItem({});
      noDataItem.set("value", 0.5);
      noDataItem.set("endValue", 1);
      xAxis.createAxisRange(noDataItem);
      noDataItem.get("label").setAll({ text: "NO", forceHidden: false });
      noDataItem.get("axisFill").setAll({ visible: true, fillOpacity: 1, fill: am5.color(0xf44336) });
      // Tooltip for NO range
      const noCount = this.noCount || Math.max(0, (this.totalCount || 0) - (this.yesCount || 0));
      noDataItem.get("axisFill").setAll({ tooltipText: `${noCount} / ${total}` });

      // Clock hand indicator
      // NOTE: invert mapping so higher "yes" percentage points to the GREEN (YES) side
      const pctVal = Math.max(0, Math.min(100, Number(this.yesPct)));
      const value = Math.max(0, Math.min(1, 1 - (pctVal / 100)));
      const axisDataItem = xAxis.makeDataItem({});
      axisDataItem.set("value", value);

      const bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(root, {
        sprite: am5radar.ClockHand.new(root, {
          radius: am5.percent(99)
        })
      }));
      xAxis.createAxisRange(axisDataItem);
      axisDataItem.get("grid").set("visible", false);

      // animate pointer on load
      axisDataItem.animate({ key: "value", to: value, duration: 800, easing: am5.ease.out(am5.ease.cubic) });

      // show chart animation
      chart.appear(1000, 100);

      // update center label with actual YES percent (pctVal)
      const centerEl = this.chartContainer?.nativeElement?.parentElement?.querySelector('.center-label') as HTMLElement | null;
      if(centerEl){
        centerEl.textContent = pctVal + "%";
        centerEl.style.color = pctVal >= 50 ? '#4caf50' : '#f44336';
      }

      this.root = root;

      // ensure chart resizes when container resizes
      if ((window as any).ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
          try {
            if (this.root) this.root.resize();
          } catch (e) {
            // ignore
          }
        });
        resizeObserver.observe(this.chartContainer.nativeElement);
        this._resizeObserver = resizeObserver;
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
    this.zone.runOutsideAngular(()=>{if(this.root) this.root.dispose();});
  }
} 