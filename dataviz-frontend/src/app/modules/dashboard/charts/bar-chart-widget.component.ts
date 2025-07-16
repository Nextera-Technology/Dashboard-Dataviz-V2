import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  DashboardWidget,
  WidgetAction,
} from "app/shared/services/dashboard.service";

declare var am5: any;
declare var am5xy: any;

@Component({
  selector: "app-bar-chart-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="chart-box relative"
      [style.background-color]="widget.data?.background || '#ffffff'"
    >
      <div class="chart-legend">Total Data : {{ widget.data.length || 0 }}</div>
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

        <!-- Manual Legend (if needed) -->
        <!-- <div class="manual-legend" *ngIf="widget.data">
          <div 
            *ngFor="let item of widget.data" 
            class="legend-item">
            <span class="legend-color" [style.background-color]="item.color"></span>
            <span class="legend-label">
              {{ item.name }}
              <span class="legend-value" [style.color]="item.color">
                <strong>{{ item.count }} ({{ item.percentage }}%)</strong>
              </span>
            </span>
          </div>
        </div> -->
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
        min-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .chart-box:hover {
        transform: translateY(-2px);
      }

      /* Chart Content */
      .chart-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .chart-legend {
        position: absolute;
        top: 10px;
        left: 14px;
        z-index: 2;
        background: rgba(255, 255, 255, 0.85);
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #15616d;
        pointer-events: none;
        text-align: left;
      }

      .chart-title {
        font-family: "Inter";
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 0 0 15px 0;
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
export class BarChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget: any;
  @Input() data: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any;

  ngOnInit(): void {
    if (this.widget.data) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  private createChart(): void {
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root.setThemes([am5.Theme.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        layout: this.root.verticalLayout,
      })
    );

    // Y Axis (categories)
    this.yAxis = this.chart.yAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: "name",
        renderer: am5xy.AxisRendererY.new(this.root, { minGridDistance: 20 }),
      })
    );
    this.yAxis.data.setAll(this.widget.data);

    // X Axis (values)
    this.xAxis = this.chart.xAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererX.new(this.root, {}),
      })
    );

    // Series
    this.series = this.chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: "Values",
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueXField: "count",
        categoryYField: "name",
        fill: am5.color("#67b7dc"),
        stroke: am5.color("#67b7dc"),
      })
    );
    this.series.data.setAll(this.widget.data);

    // Bar colors
    this.series.columns.template.adapters.add(
      "fill",
      (fill: any, target: any) => {
        return am5.color(target.dataItem.dataContext.color || "#67b7dc");
      }
    );
    this.series.columns.template.adapters.add(
      "stroke",
      (stroke: any, target: any) => {
        return am5.color(target.dataItem.dataContext.color || "#67b7dc");
      }
    );

    // Tooltips
    this.series.columns.template.set("tooltipText", "{name}: {count}");

    // Appearance
    this.series.columns.template.setAll({
      cornerRadiusTL: 6,
      cornerRadiusBL: 6,
      strokeWidth: 2,
    });

    // Animate
    this.series.appear(1000);
    this.chart.appear(1000, 100);
  }

  onActionClick(action: string): void {
    console.log("Action clicked:", action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
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
}
