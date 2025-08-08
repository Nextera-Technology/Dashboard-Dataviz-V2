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

declare var am5: any;
declare var am5percent: any;

@Component({
  selector: "app-pie-chart-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent],
  template: `
    <div
      class="chart-box"
      [style.background-color]="widget?.background || '#ffffff'"
    >
     <!-- Action Buttons -->
      <app-actions-buttons [widget]="widget"></app-actions-buttons>

      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>
<br>
        <div #chartContainer class="chart-container"></div>

        <!-- Manual Legend -->
        <div class="chart-legend" >
          Total Data Used : {{ data && data.length && data[0].totalData ?? data[0].totalData || 0 }}
        </div>
      </div>
      
      <!-- Buttons to toggle display mode -->
      <div class="display-mode-toggle">
        <button (click)="setDisplayMode('side')" [class.active]="displayMode === 'side'">Side</button>
        <button (click)="setDisplayMode('list')" [class.active]="displayMode === 'list'">List</button>
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
        padding-bottom: 50px; /* Add padding to prevent overlap */
        transition: all 0.3s ease;
        min-height: 120px;
        display: flex;
        flex-direction: column;
      }

      .display-mode-toggle {
        position: absolute;
        bottom: 8px;
        left: 8px;
        z-index: 100;
        display: flex;
        gap: 4px;
        background-color: rgba(240, 240, 240, 0.9);
        padding: 4px;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }

      .display-mode-toggle button {
        border: 1px solid transparent;
        background-color: transparent;
        padding: 4px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: #555;
        transition: all 0.2s ease-in-out;
      }

      .display-mode-toggle button.active {
        background-color: #ffffff;
        border-color: #ddd;
        color: #0d6efd;
        font-weight: 600;
      }

      .display-mode-toggle button:not(.active):hover {
        background-color: rgba(0, 0, 0, 0.05);
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
        height: 100%;
        width: 100%;
        min-height: 100px;
        max-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
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
  public displayMode: "side" | "list" = "side";

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

  public setDisplayMode(mode: "side" | "list"): void {
    if (this.displayMode !== mode) {
      this.displayMode = mode;
      if (this.data) {
        this.createChart();
      }
    }
  }

  private createChart(): void {
    if (this.root) {
      this.root.dispose();
    }
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root._logo.dispose();
    this.root.setThemes([am5.Theme.new(this.root)]);
    
    const data = this.data.map((item: any) => ({
      name: item.name,
      value: item.count,
      color: item.color,
    }));

    if (this.displayMode === 'side') {
      // SIDE MODE: Labels on chart
      this.chart = this.root.container.children.push(
        am5percent.PieChart.new(this.root, {
          layout: this.root.horizontalLayout,
          innerRadius: am5.percent(50),
          radius: am5.percent(60),
        })
      );
      this.series = this.chart.series.push(
        am5percent.PieSeries.new(this.root, {
          name: "Series",
          categoryField: "name",
          valueField: "value",
          alignLabels: false,
          fillField: "color",
        })
      );
      this.series.data.setAll(data); // Set data before configuring labels
      this.series.labels.template.setAll({
        text: "{category}: {value} ({valuePercentTotal.formatNumber('#.0')}%)",
        fontSize: "12px",
        maxWidth: 125,
        oversizedBehavior: "wrap",
        paddingBottom: 15,
        paddingRight: 10,
        forceHidden: false,
        radius: 20,
      });

    } else {
      // LIST MODE: Legend at bottom
      this.chart = this.root.container.children.push(
        am5percent.PieChart.new(this.root, {
          layout: this.root.verticalLayout,
          innerRadius: am5.percent(50),
          radius: am5.percent(60),
        })
      );
      this.series = this.chart.series.push(
        am5percent.PieSeries.new(this.root, {
          name: "Series",
          categoryField: "name",
          valueField: "value",
          alignLabels: false,
          fillField: "color",
        })
      );
      this.series.data.setAll(data); // Set data before legend
      this.series.labels.template.set("forceHidden", true);
      this.series.ticks.template.set("forceHidden", true);
      
      const scrollbar = am5.Scrollbar.new(this.root, {
        orientation: "vertical",
      });
      scrollbar.thumb.setAll({
        fill: am5.color(0x000000),
        fillOpacity: 0.2,
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        cornerRadiusBL: 4,
        cornerRadiusBR: 4,
      });

      const legend = this.chart.children.push(
        am5.Legend.new(this.root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          marginTop: 15,
          marginBottom: 15,
          layout: this.root.verticalLayout,
          width: am5.percent(90),
          height: am5.percent(40),
          verticalScrollbar: scrollbar,
        })
      );
      legend.labels.template.setAll({ text: "{category}", oversizedBehavior: "truncate", maxWidth: 120 });
      legend.valueLabels.template.setAll({ text: "= {value}", textAlign: "right"});
      legend.data.setAll(this.series.dataItems); // Set legend data after series data
    }

    // Common settings for both modes
    this.series.slices.template.setAll({
        tooltipText:  "{category}: {value} ({valuePercentTotal.formatNumber('#.0')}%)",
        stroke: am5.color(0xffffff),
        strokeWidth: 1.5,
        cornerRadius: 5,
        shiftRadius: 3,
    });
    this.series.set(
      "colors",
      am5.ColorSet.new(this.root, {
        colors: data.map((item: any) => am5.color(item.color)),
      })
    );
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
