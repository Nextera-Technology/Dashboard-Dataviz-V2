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
declare var am5percent: any;

@Component({
  selector: "app-pie-chart-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="chart-box"
      [style.background-color]="widget?.background || '#ffffff'"
    >
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

      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>
<br>
        <div #chartContainer class="chart-container"></div>

        <!-- Manual Legend -->
        <div class="chart-legend" >
          Total Data Used : {{ data && data.length && data[0].totalData ?? data[0].totalData || 0 }}
        </div>
        <!-- <div class="manual-legend" *ngIf="data">
          <div *ngFor="let item of data" class="legend-item">
            <span class="legend-color"></span>
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

      .chart-title {
        font-family: 'Inter';
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 15px 0 15px 0;
        line-height: 1.3;
      }

      .chart-container {
        height: 350px;
        width: 100%;
        // margin-bottom: 15px;
        // margin-top: 15px
        /* Ensure the container has enough space for the chart and legend */
      }

      /* Manual Legend - Keep if you intend to use it, otherwise remove */
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
export class PieChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget: any;
  @Input() data: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  actions: [
    {
      id: "1";
      type: "primary";
      title: "Info";
      label: "Info";
      icon: "paragraph.png";
      action: "info";
    },
    {
      id: "2";
      type: "secondary";
      title: "Export";
      label: "Export";
      icon: "excel.png";
      action: "export";
    },
    {
      id: "3";
      type: "secondary";
      title: "Audience";
      label: "Audience";
      icon: "audience_4644048.png";
      action: "audience";
    },
  ];
  private root: any;
  private chart: any;
  private series: any;

  ngOnInit(): void {
    if (this.data) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  private createChart(): void {
    // Create root element
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root._logo.dispose();

    // Set themes
    this.root.setThemes([am5.Theme.new(this.root)]);

    // Create chart
    this.chart = this.root.container.children.push(
      am5percent.PieChart.new(this.root, {
        layout: this.root.horizontalLayout, // Use vertical layout for chart and legend
        innerRadius: am5.percent(50),
        radius: am5.percent(60), // Make the chart smaller (70% of container)
      })
    );

    // Create series
    this.series = this.chart.series.push(
      am5percent.PieSeries.new(this.root, {
        name: "Series",
        categoryField: "name",
        valueField: "value",
        alignLabels: false,
        fillField: "color",
        legendLabelText: "{name}", // No longer needed if using custom label template
        legendValueText: "{valuePercentTotal.formatNumber('#.0')}%", // No longer needed
      })
    );

    // Set data
    const data = this.data.map((item: any) => ({
      name: item.name,
      value: item.count,
      color: item.color, // Pass color to amCharts data for consistent coloring
      percentage: item.percentage, // Pass percentage for custom label/value
    }));

    this.series.data.setAll(data);
    this.series.labels.template.setAll({
      text: "{name}: {value} {percentage}%",
      fontSize: "12px", // Adjust font size if needed
      maxWidth: 125, // Set maximum width for labels
      oversizedBehavior: "wrap", // Wrap long text
      paddingBottom: 15,
      paddingRight: 10
    });

    // Configure series appearance
    this.series.slices.template.setAll({
      tooltipText:  "{name}: {count} {percentage}%",
      stroke: am5.color(0xffffff),
      strokeWidth: 1.5,
      cornerRadius: 5,
      shiftRadius: 8,
    });

    // Set colors
    this.series.set(
      "colors",
      am5.ColorSet.new(this.root, {
        colors: data.map((item: any) => am5.color(item.color)), // Ensure am5.color conversion
      })
    );

    // Add legend
    const legend = this.chart.children.push(
      am5.Legend.new(this.root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: this.root.gridLayout, // Use gridLayout for wrapping
        // If you want the legend below the chart, remove centerY and y,
        // and ensure the chart layout is vertical.
        // It will automatically position itself below the chart due to chart.children.push
      })
    );

    // Customize legend item template
    legend.itemContainers.template.setAll({
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 2,
      paddingBottom: 2,
    });

    // Customize marker and label for each legend item
    legend.labels.template.setAll({
      oversizedBehavior: "wrap", // Wrap long labels
      maxWidth: 150, // Max width for legend labels
      fontSize: 14,
      textAlign: "left",
      populateText: true, // Enable text population
    });

    // Custom label text for legend (combining name and percentage)
    legend.labels.template.set("text", "{name} [bold]({percentage}%)"); // Using custom percentage from data

    // Hide value labels from legend as we're embedding it in the main label
    legend.valueLabels.template.set("forceHidden", true);

    legend.data.setAll(this.series.dataItems);

    // Set up animations
    this.series.appear(1000, 100);
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
}
