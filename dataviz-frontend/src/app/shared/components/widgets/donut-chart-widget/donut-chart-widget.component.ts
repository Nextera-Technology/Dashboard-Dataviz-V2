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
import * as am5percent from "@amcharts/amcharts5/percent";
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
  selector: "app-donut-chart-widget",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="donut-chart-container">
      <span class="total-data" *ngIf="totalData > 0">Total Data : {{ totalData }}</span>
      <div [id]="chartDivId" class="donut-chart"></div>
    </div>
  `,
  styles: [`
    .donut-chart-container { width: 100%; height: 100%; position: relative; }
    .donut-chart { width: 100%; height: 100%; min-height: 200px; max-height: 400px; }
    .total-data { position: absolute; top: 0; left: 8px; font-size: 14px; font-weight: 600; color: #0d7680; }
  `]
})
export class DonutChartWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() widget!: Widget;
  @Input() data: any[] | undefined;

  private root?: am5.Root;

  get totalData(): number {
    if (!this.data || this.data.length === 0) return 0;
    const first = this.data[0];
    if (first && first.totalData !== undefined) return first.totalData;
    return this.data.reduce((s:number,i:any)=>s+(i.count??0),0);
  }

  get chartDivId(): string { return `donut-chart-div-${this.widget._id}`; }

  constructor(private zone: NgZone) {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if(!this.data||this.data.length===0) return;
    this.zone.runOutsideAngular(()=>{
      const root = am5.Root.new(this.chartDivId);
      root.setThemes([am5themes_Animated.new(root)]);
      
      // Calculate responsive chart radius based on widget size
      const chartRadius = this.getResponsiveChartRadius();
      
      const chart = root.container.children.push(am5percent.PieChart.new(root,{ 
        layout: root.verticalLayout, 
        innerRadius: am5.percent(50),
        radius: am5.percent(chartRadius)
      }));
      const series = chart.series.push(am5percent.PieSeries.new(root,{ valueField: "count", categoryField: "name", alignLabels:false }));
      
      // Add tooltip for slices
      series.slices.template.setAll({
        tooltipText: "{name}: {count} ({percentage}%)",
        cornerRadius: 5,
        shiftRadius: 3
      });
      
      series.labels.template.setAll({ 
        textType:"circular", 
        centerX:0, 
        centerY:0, 
        fontSize:"12px", 
        maxWidth:125, 
        oversizedBehavior:"wrap",
        // Add tooltip for truncated labels
        tooltipText: "{name}: {count} {percentage}%",
        tooltipPosition: "pointer"
      });
      series.data.setAll(this.data);
      series.appear(1000,100);
      this.root = root;
    });
  }

  ngOnDestroy(): void { this.zone.runOutsideAngular(()=>{ if(this.root) this.root.dispose(); }); }

  private getResponsiveChartRadius(): number {
    // Get widget dimensions
    const columnSize = this.widget.columnSize || 1;
    const rowSize = this.widget.rowSize || 1;
    
    // Calculate base radius based on widget size
    let baseRadius = 60; // Default 60%
    
    // For 1x1 widgets, use smaller radius to prevent overflow
    if (columnSize === 1 && rowSize === 1) {
      baseRadius = 40; // 40% for very small widgets
    } else if (columnSize <= 2 && rowSize <= 2) {
      baseRadius = 50; // 50% for small widgets
    } else {
      baseRadius = 60; // 60% for larger widgets
    }
    
    return baseRadius;
  }
} 