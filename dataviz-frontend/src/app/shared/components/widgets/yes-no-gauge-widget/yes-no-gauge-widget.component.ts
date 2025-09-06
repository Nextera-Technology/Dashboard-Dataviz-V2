import { Component, Input, OnInit, AfterViewInit, OnDestroy, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ActionsButtonsComponent } from "app/shared/components/actions-buttons/actions-buttons.component";
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';

interface WidgetData { name?: string; count?: number; percentage?: number; totalData?: number; }
interface Widget {
  _id?: string;
  chartType?: string;
  data?: WidgetData[];
  title: string;
  widgetType: string;
  columnSize: number;
  rowSize: number;
  background?: string;
  visible?: boolean;
  status?: string;
}

@Component({
  selector: "app-yes-no-gauge-widget",
  standalone: true,
  imports: [CommonModule, ActionsButtonsComponent, TranslatePipe],
  template: `
    <div
      class="chart-box"
      [ngClass]="{ 'short-row': (widget?.rowSize || 1) <= 1 }"
      [style.background-color]="widget?.background || '#ffffff'"
    >
      <!-- Action Buttons -->
      <app-actions-buttons [widget]="widget"></app-actions-buttons>
      <!-- Widget Content -->
      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>
        <!-- Gauge Container -->
        <div class="gauge-container">
          <div [id]="chartDivId" class="gauge-chart"></div>
          <div class="center-label" *ngIf="yesPct!==null">{{ yesPct }}%</div>
        </div>
        <!-- Total Data -->
        <div class="chart-legend">
          {{ 'shared.worldMapWidget.students_total_label' | translate }} {{ getTotalData() }}
        </div>
      </div>
    </div>
  `,
  styles:[`
    .chart-box {
      height: 100%;
      position: relative;
      text-align: center;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      min-height: 120px;
      display: flex;
      flex-direction: column;
    }

    .chart-box.short-row {
      padding: 12px;
    }
    .chart-box.short-row .chart-title {
      margin: 10px 0 8px 0;
      font-size: 16px;
    }

    .chart-legend {
      position: absolute;
      top: 10px;
      left: 14px;
      z-index: 2;
      background: rgba(255,255,255,0.85);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #15616d;
      pointer-events: none;
      text-align: left;
    }

    .chart-box:hover {
      transform: translateY(-2px);
    }

    .chart-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .chart-title {
      font-family: 'Inter';
      font-size: 18px;
      font-weight: 600;
      color: #00454d;
      margin: 15px 0 15px 0;
      line-height: 1.3;
    }

    .gauge-container {
      position: relative;
      width: 100%;
      flex: 1;
      min-height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .gauge-chart {
      width: 100%;
      height: 100%;
      min-height: 150px;
    }
    
    .center-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: 700;
      color: #4caf50;
      z-index: 10;
    }

    @media (max-width: 768px) {
      .chart-box {
        padding: 15px;
        min-height: 200px;
      }

      .chart-title {
        font-size: 16px;
      }

      .gauge-container {
        min-height: 120px;
      }
    }
  `]
})
export class YesNoGaugeWidgetComponent implements OnInit,AfterViewInit,OnDestroy{
  @Input() widget!:Widget;
  @Input() data:WidgetData[]|undefined;
  yesPct:number|null=null;
  yesCount:number=0;
  noCount:number=0;
  totalCount:number=0;
  private root?:am5.Root;
  // guard if widget or id missing
  get chartDivId(){
    const id = this.widget && this.widget._id ? this.widget._id : Math.random().toString(36).slice(2,9);
    return `yes-no-gauge-div-${id}`;
  }
  constructor(private zone:NgZone){}
  
  // Check if this is a job description widget that needs custom labels
  get isJobDescriptionWidget(): boolean {
    return this.widget?.widgetType === 'JOBDESC_COMPETENCY_USAGE' || 
           this.widget?.widgetType === 'JOBDESC_PROFESSIONAL_EVALUATIONS';
  }

  // Get dynamic labels from data
  get dynamicLabels(): { leftLabel: string; rightLabel: string } {
    if (!this.data || this.data.length < 2) {
      return { leftLabel: 'NO', rightLabel: 'YES' };
    }
    
    // Use the actual field names from data
    return {
      leftLabel: this.data[1]?.name || 'NO',  // Second item (typically "Not Used" or "Not Completed")
      rightLabel: this.data[0]?.name || 'YES'  // First item (typically "Used" or "Completed by Mentor")
    };
  }

  // Get total data count for display
  getTotalData(): number {
    if (!this.data || this.data.length === 0) {
      return 0;
    }
    return this.data[0]?.totalData || this.totalCount || 0;
  }
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
  ngAfterViewInit(){
    if(this.yesPct===null) return;
    this.zone.runOutsideAngular(()=>{
      const root = am5.Root.new(this.chartDivId);
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

      // NO range (0..0.5) - left side (red) - use dynamic labels
      const noDataItem = xAxis.makeDataItem({});
      noDataItem.set("value", 0);
      noDataItem.set("endValue", 0.5);
      xAxis.createAxisRange(noDataItem);
      const labels = this.dynamicLabels;
      noDataItem.get("label").setAll({ text: labels.leftLabel.toUpperCase(), forceHidden: false });
      noDataItem.get("axisFill").setAll({ visible: true, fillOpacity: 1, fill: am5.color(0xf44336) });
      // Tooltip for NO range
      const yesCount = this.yesCount || 0;
      const total = this.totalCount || (yesCount + (this.noCount || 0));
      const noCount = this.noCount || Math.max(0, (this.totalCount || 0) - (this.yesCount || 0));
      const noTooltip = `${labels.leftLabel}: ${noCount} / ${total}`;
      noDataItem.get("axisFill").setAll({ tooltipText: noTooltip });

      // YES range (0.5..1) - right side (green) - use dynamic labels
      const yesDataItem = xAxis.makeDataItem({});
      yesDataItem.set("value", 0.5);
      yesDataItem.set("endValue", 1);
      xAxis.createAxisRange(yesDataItem);
      yesDataItem.get("label").setAll({ text: labels.rightLabel.toUpperCase(), forceHidden: false });
      yesDataItem.get("axisFill").setAll({ visible: true, fillOpacity: 1, fill: am5.color(0x4caf50) });
      // Tooltip for YES range
      const yesTooltip = `${labels.rightLabel}: ${yesCount} / ${total}`;
      yesDataItem.get("axisFill").setAll({ tooltipText: yesTooltip });

      // Clock hand indicator
      // Map percentage directly: 0% = 0 (left/NO), 100% = 1 (right/YES)
      const pctVal = Math.max(0, Math.min(100, Number(this.yesPct)));
      const value = pctVal / 100; // Direct mapping: 0% -> 0, 100% -> 1
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
      const centerEl = document.getElementById(this.chartDivId)?.querySelector('.center-label') as HTMLElement | null;
      if(centerEl){
        centerEl.textContent = pctVal + "%";
        centerEl.style.color = pctVal >= 50 ? '#4caf50' : '#f44336';
      }

      this.root = root;
    });
  }
  ngOnDestroy(){this.zone.runOutsideAngular(()=>{if(this.root) this.root.dispose();});}
} 