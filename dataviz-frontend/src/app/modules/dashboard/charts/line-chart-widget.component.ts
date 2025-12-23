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
import { ActionsButtonsComponent } from "app/shared/components/actions-buttons/actions-buttons.component";
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';

declare var am5: any;
declare var am5xy: any;

@Component({
  selector: "app-line-chart-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent, TranslatePipe],
  template: `
    <div
      class="chart-box relative"
      [style.background-color]="widget?.background || '#ffffff'"
    >
      <div class="chart-legend">{{ 'shared.worldMapWidget.students_total_label' | translate }} {{ totalData }}</div>
       <!-- Action Buttons -->
     <app-actions-buttons [widget]="widget"></app-actions-buttons>

      <!-- Widget Content -->
      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>

        <!-- Chart Container -->
        <div #chartContainer class="chart-container h-full w-full"></div>

        <!-- Manual Legend (if needed) -->
        <!-- <div class="manual-legend" *ngIf="widget.data">
          <div *ngFor="let series of widget.data" class="legend-item">
            <span class="legend-label">
              {{ series.name }}
              <span class="legend-value">
                <strong>{{ series.count }} ({{ series.percentage }}%)</strong>
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
        min-height: 220px;
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
        margin: 15px 0 15px 0;
        line-height: 1.3;
      }

      .chart-container {
        height: 100%;
        width: 100%;
        min-height: 150px;
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

      /* Responsive */
      @media (max-width: 768px) {
        .chart-box {
          padding: 15px;
          min-height: 220px;
        }

        .chart-title {
          font-size: 16px;
        }

        .chart-container {
          height: 100%;
        }

        .legend-item {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class LineChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget: any;
  @Input() data: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  totalData: number = 0;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any;

  ngOnInit(): void {
    this.calculateTotalData();
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
    if (this.root) {
      this.root.dispose(); // ✅ Clean up before creating a new chart
    }
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root._logo.dispose();
    this.root.setThemes([am5.Theme.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: this.root.verticalLayout,
      })
    );

    // X Axis
    this.xAxis = this.chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: "name",
        renderer: am5xy.AxisRendererX.new(this.root, { minGridDistance: 30 }),
        tooltip: am5.Tooltip.new(this.root, {}),
      })
    );

    // Y Axis
    this.yAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );

    this.xAxis.data.setAll(this.widget.data);
    this.yAxis.data.setAll(this.widget.data);

    this.series = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: this.widget.title,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueYField: "count",
        categoryXField: "name",
        stroke: am5.color("#67b7dc"),
        fill: am5.color("#67b7dc"),
        strokeWidth: 3,
        fillOpacity: 0.1,
        tooltip: am5.Tooltip.new(this.root, {
          // labelText: "Envoyé: {valueY}"
          labelText: "{valueY}",
        }),
      })
    );

    this.series.strokes.template.setAll({
      strokeWidth: 3,
    });

    this.series.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 5,
          fill: am5.color("#67b7dc"),
          stroke: am5.color("#15616D"),
          strokeWidth: 2,
        }),
      });
    });

    this.series.bullets.push(() =>
      am5.Bullet.new(this.root, {
        sprite: am5.Label.new(this.root, {
          populateText: true, // ✅ important!
          text: "{valueY}",
          centerY: am5.percent(100),
          centerX: am5.percent(50),
          dy: -5,
          fontSize: 14,
          fill: am5.color(0x000000),
        }),
      })
    );
    this.chart.set(
      "cursor",
      am5xy.XYCursor.new(this.root, {
        behavior: "none",
        xAxis: this.xAxis,
        yAxis: this.yAxis,
      })
    );

    this.series.data.setAll(this.data);

    // Legend
    // const legend = this.chart.children.push(
    //   am5.Legend.new(this.root, {
    //     centerX: am5.percent(50),
    //     x: am5.percent(50),
    //     centerY: am5.percent(100),
    //     y: am5.percent(100),
    //     layout: this.root.horizontalLayout,
    //   })
    // );

    // legend.data.setAll([this.series]);

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
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/paragraph.png",
      "excel.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/excel.png",
      "audience_4644048.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png",
    };
    return (
      iconMap[iconName] ||
      `https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/${iconName}`
    );
  }

  private calculateTotalData(): void {
    if (!this.widget?.data) {
      this.totalData = 0;
      return;
    }

    const dataArray = Array.isArray(this.widget.data) ? this.widget.data : [];
    if (dataArray.length) {
      this.totalData = dataArray[0]?.totalData ?? dataArray.reduce((sum: number, item: any) => sum + (item.count ?? 0), 0);
    } else if (this.widget.data?.series && Array.isArray(this.widget.data.series)) {
      const series0 = this.widget.data.series[0];
      this.totalData = series0?.totalData ?? this.widget.data.series.reduce((sum: number, item: any) => sum + (item.value ?? item.count ?? 0), 0);
    } else {
      this.totalData = this.widget.data.totalData ?? 0;
    }
  }
}
