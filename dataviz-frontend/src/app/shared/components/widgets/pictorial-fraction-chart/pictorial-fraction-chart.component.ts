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
import * as am5percent from "@amcharts/amcharts5/percent"; // For PictorialStackedSeries
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { MatIconModule } from "@angular/material/icon"; // For no-data icon

interface Widget {
  _id?: string;
  chartType?: string; // Should be 'PictorialStackedSeries' for this component
  data?: any[]; // Array of data objects for the chart
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
  selector: "app-pictorial-fraction-chart",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: "./pictorial-fraction-chart.component.html",
  styleUrl: "./pictorial-fraction-chart.component.scss",
})
export class PictorialStackedChartWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() widget!: Widget;
  @Input() data: any[] | undefined;

  private root!: am5.Root;
  private chart!: am5percent.SlicedChart; // PictorialStackedSeries is typically pushed into a PieChart root

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.data || this.data.length === 0) {
        console.warn(
          "PictorialStackedChartWidget: No data provided.",
          this.widget.title
        );
        return;
      }
      const root = am5.Root.new(
        `pictorial-stacked-chart-div-${this.widget._id}`
      );

      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5percent.SlicedChart.new(root, {
          layout: root.horizontalLayout,
        })
      );

      // Create series
      const series = chart.series.push(
        am5percent.PictorialStackedSeries.new(root, {
          name: "Series",
          orientation: "vertical",
          valueField: "count",
          categoryField: "name",
          svgPath: `M38.022,16.348c0,0.807-0.484,1.534-1.229,1.846l-0.771,0.322v4.43c0,0.552-0.447,1-1,1c-0.554,0-1-0.448-1-1v-3.594
		l-2.312,0.968v5.085c0,0.859-0.554,1.626-1.369,1.896l-10.188,3.386c-0.205,0.068-0.418,0.104-0.632,0.104
		c-0.192,0-0.389-0.028-0.577-0.085L7.736,27.319c-0.845-0.257-1.423-1.033-1.423-1.915v-5.085l-5.084-2.126
		C0.486,17.881,0,17.154,0,16.348c0-0.806,0.484-1.534,1.229-1.845L18.24,7.388c0.491-0.206,1.049-0.206,1.543,0l17.01,7.115
		C37.537,14.813,38.022,15.541,38.022,16.348z`,
        })
      );

      series.labelsContainer.set("width", 100);
      series.ticks.template.set("location", 0.6);

      series.data.setAll(this.data);

      series.appear(1000, 100);

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
