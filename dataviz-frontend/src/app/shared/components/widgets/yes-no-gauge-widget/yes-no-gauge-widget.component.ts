import { Component, Input, OnInit, AfterViewInit, OnDestroy, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface WidgetData { name?: string; count?: number; percentage?: number; }
interface Widget {
  _id?: string;
  chartType?: string;
  data?: WidgetData[];
  title: string;
  widgetType: string;
  columnSize: number;
  rowSize: number;
}

@Component({
  selector: "app-yes-no-gauge-widget",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gauge-container">
      <div [id]="chartDivId" class="gauge-chart"></div>
      <div class="center-label" *ngIf="yesPct!==null">{{ yesPct }}%</div>
    </div>
  `,
  styles:[`
    .gauge-container{position:relative;width:100%;height:100%;}
    .gauge-chart{width:100%;height:100%;min-height:150px;}
    .center-label{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;font-weight:700;color:#4caf50;}
  `]
})
export class YesNoGaugeWidgetComponent implements OnInit,AfterViewInit,OnDestroy{
  @Input() widget!:Widget;
  @Input() data:WidgetData[]|undefined;
  yesPct:number|null=null;
  private root?:am5.Root;
  get chartDivId(){return `yes-no-gauge-div-${this.widget._id}`;}
  constructor(private zone:NgZone){}
  ngOnInit(){
    if(this.data&&this.data.length){
      if(this.data.length===1){this.yesPct=this.data[0].percentage??this.data[0].count??null;}
      else{
        const yes=this.data[0].count??0;
        const no=this.data[1]?.count??0;
        const total=yes+no;
        this.yesPct= total? Math.round((yes/total)*100):null;
      }
    }
  }
  ngAfterViewInit(){if(this.yesPct===null) return;this.zone.runOutsideAngular(()=>{
    const root=am5.Root.new(this.chartDivId);
    root.setThemes([am5themes_Animated.new(root)]);
    const chart=root.container.children.push(am5percent.PieChart.new(root,{startAngle:-90,endAngle:270,innerRadius:am5.percent(80)}));
    const series=chart.series.push(am5percent.PieSeries.new(root,{valueField:"value",categoryField:"cat",startAngle:-90,endAngle:270}));
    series.get("colors")!.set("colors",[am5.color(0x4caf50),am5.color(0xf44336)]);
    series.slices.template.setAll({strokeOpacity:0});
    series.labels.template.set("forceHidden",true);
    series.ticks.template.set("forceHidden",true);
    series.data.setAll([{cat:"yes",value:this.yesPct},{cat:"no",value:100-this.yesPct}]);
    series.appear(1000,100);
    this.root=root;
  });}
  ngOnDestroy(){this.zone.runOutsideAngular(()=>{if(this.root) this.root.dispose();});}
} 