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
import { ActionsButtonsComponent } from "app/shared/components/actions-buttons/actions-buttons.component";

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
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent],
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
        <!-- Chart Container -->
        <div #chartContainer class="chart-container"></div>
        <!-- Total Data -->
        <div class="chart-legend">
          Total Student : {{ data && data.length && data[0].totalData ?? data[0].totalData || 0 }}
        </div>

        <!-- Manual Legend (sembunyikan untuk tile 1-row agar tidak overflow) -->
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

      /* Lebih rapat untuk tile 1-row (1x1, 2x1) agar tidak overflow */
      .chart-box.short-row {
        padding: 12px;
      }
      .chart-box.short-row .chart-title {
        margin: 10px 0 8px 0;
        font-size: 16px;
      }
      .chart-box.short-row .manual-legend {
        display: none; /* sembunyikan legend manual pada tinggi pendek */
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

      /* Chart Content */
      .chart-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0; /* penting agar child boleh menyusut */
      }

      .chart-title {
        font-family: 'Inter';
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 15px 0 15px 0;
        line-height: 1.3;
      }

      /* Kunci: jadikan container fleksibel agar tidak overflow */
      .chart-container {
        height: 100%;
        width: 100%;
        min-height: 120px;
        max-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }

      /* Manual Legend */
      .manual-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 6px;
        overflow: hidden; /* no scroll default */
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
          min-height: 180px;
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
      (root as any)._logo?.dispose();

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

      // Compact labels on small tiles similar to builder behavior
      const colSize = Number(this.widget?.columnSize || 1);
      const rowSize = Number(this.widget?.rowSize || 1);
      const isSmall =
        (colSize === 1 && rowSize === 1) ||
        (colSize === 2 && rowSize === 1) ||
        (colSize === 1 && rowSize === 2);

      series.labelsContainer.set("width", isSmall ? 70 : 100);
      series.ticks.template.set("visible", false);
      if (isSmall) {
        series.labels.template.setAll({
          fontSize: "9px",
          maxWidth: 70,
          oversizedBehavior: "truncate",
        });
      } else {
        series.labels.template.setAll({
          text: "{name}: {value} {percentage}%",
        });
      }

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
