import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent"; // For PictorialStackedSeries
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { MatIconModule } from "@angular/material/icon"; // For no-data icon
import { MatButtonModule } from "@angular/material/button";

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
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="chart-box"
      [style.background-color]="widget?.background || '#ffffff'"
    >
      <!-- Action Buttons -->
      <div class="button-container">
        <button class="info-button primary" (click)="onActionClick('info')">
          <img [src]="getActionIcon('paragraph.png')" alt="Info" />
        </button>
        <button class="info-button secondary" (click)="onActionClick('export')">
          <img [src]="getActionIcon('excel.png')" alt="Export" />
        </button>
        <button
          class="info-button secondary"
          (click)="onActionClick('audience')"
        >
          <img [src]="getActionIcon('audience_4644048.png')" alt="Audience" />
        </button>
      </div>

      <!-- Widget Content -->
      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>

        <!-- Chart Container -->
        <div #chartContainer class="chart-container"></div>

        <!-- Manual Legend -->
        <div class="manual-legend" *ngIf="data">
          <div *ngFor="let item of data" class="legend-item">
            <span class="legend-color"></span>
            <span class="legend-label">
              {{ item.name }}
              <span class="legend-value" [style.color]="item.color">
                <strong>{{ item.count }} ({{ item.percentage }}%)</strong>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chart-box {
        position: relative;
        text-align: center;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        min-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .chart-box:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      /* Chart Content */
      .chart-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .chart-title {
        font-family: 'Inter';
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 15px 0 15px 0;
        line-height: 1.3;
      }

      .chart-container {
        height: 300px;
        width: 100%;
        margin-bottom: 15px;
      }

      /* Manual Legend */
      .manual-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        flex-shrink: 0;
      }

      .legend-label {
        flex: 1;
        text-align: left;
        color: #333;
      }

      .legend-value {
        font-weight: 600;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .chart-box {
          padding: 15px;
          min-height: 250px;
        }

        .chart-title {
          font-size: 16px;
        }

        .chart-container {
          height: 250px;
        }

        .legend-item {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class PictorialStackedChartWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() widget!: Widget;
  @Input() data: any[] | undefined;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

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
      const root = am5.Root.new(this.chartContainer.nativeElement);

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

  onActionClick(action: string): void {
    console.log("Action clicked:", action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    // Return placeholder icon URLs - in real app, these would be actual icons
    const iconMap: { [key: string]: string } = {
      "paragraph.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/paragraph.png",
      "excel.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/excel.png",
      "audience_4644048.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png",
    };

    return (
      iconMap[iconName] ||
      `https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/${iconName}`
    );
  }
  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }
}
