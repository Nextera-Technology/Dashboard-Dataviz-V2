import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardWidget, WidgetAction } from '../../services/dashboard.service';

declare var am5: any;
declare var am5xy: any;

@Component({
  selector: 'app-line-chart-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="chart-box" [style.background-color]="widget.data?.background || '#ffffff'">
      <!-- Action Buttons -->
      <div class="button-container" *ngIf="widget.actions && widget.actions.length > 0">
        <button 
          *ngFor="let action of widget.actions" 
          class="info-button"
          [class]="action.type"
          [title]="action.title"
          (click)="onActionClick(action)">
          <img [src]="getActionIcon(action.icon)" [alt]="action.title">
        </button>
      </div>

      <!-- Widget Content -->
      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>
        
        <!-- Chart Container -->
        <div #chartContainer class="chart-container"></div>
        
        <!-- Manual Legend (if needed) -->
        <div class="manual-legend" *ngIf="widget.data?.series">
          <div 
            *ngFor="let series of widget.data.series" 
            class="legend-item">
            <span class="legend-color" [style.background-color]="series.color"></span>
            <span class="legend-label">
              {{ series.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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

    /* Action Buttons */
    .button-container {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 5px;
      z-index: 10;
    }

    .info-button {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 4px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }

    .info-button:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.1);
    }

    .info-button.primary {
      background: rgba(21, 97, 109, 0.9);
    }

    .info-button.secondary {
      background: rgba(46, 158, 143, 0.9);
    }

    .info-button img {
      width: 16px;
      height: 16px;
    }

    /* Chart Content */
    .chart-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chart-title {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #00454D;
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
  `]
})
export class LineChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget!: DashboardWidget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any[] = [];

  ngOnInit(): void {
    if (this.widget.data?.series) {
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
        layout: this.root.verticalLayout
      })
    );

    // X Axis (time/categories)
    this.xAxis = this.chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(this.root, { minGridDistance: 30 }),
        tooltip: am5.Tooltip.new(this.root, {})
      })
    );

    // Y Axis (values)
    this.yAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {})
      })
    );

    // Set categories
    const categories = this.widget.data.categories || [];
    this.xAxis.data.setAll(categories.map((cat: string, index: number) => ({ category: cat })));

    // Create series for each data series
    this.widget.data.series.forEach((seriesData: any, index: number) => {
      const series = this.chart.series.push(
        am5xy.LineSeries.new(this.root, {
          name: seriesData.name,
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          valueYField: 'value',
          categoryXField: 'category',
          stroke: am5.color(seriesData.color || '#67b7dc'),
          strokeWidth: 3,
          fill: am5.color(seriesData.color || '#67b7dc'),
          fillOpacity: 0.1
        })
      );

      // Set data for this series
      const data = categories.map((cat: string, catIndex: number) => ({
        category: cat,
        value: seriesData.data[catIndex] || 0
      }));
      series.data.setAll(data);

      // Configure appearance
      series.bullets.push(() => {
        return am5.Bullet.new(this.root, {
          sprite: am5.Circle.new(this.root, {
            radius: 5,
            fill: am5.color(seriesData.color || '#67b7dc'),
            stroke: am5.color(seriesData.color || '#67b7dc'),
            strokeWidth: 2
          })
        });
      });

      // Add tooltip
      series.set('tooltipText', '{name}: {valueY}');

      this.series.push(series);
    });

    // Add legend
    const legend = this.chart.children.push(
      am5.Legend.new(this.root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        centerY: am5.percent(100),
        y: am5.percent(100),
        layout: this.root.horizontalLayout
      })
    );

    legend.data.setAll(this.series);

    // Animate
    this.series.forEach(series => {
      series.appear(1000, 100 * this.series.indexOf(series));
    });
    this.chart.appear(1000, 100);
  }

  onActionClick(action: WidgetAction): void {
    console.log('Action clicked:', action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'paragraph.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/paragraph.png',
      'excel.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/excel.png',
      'audience_4644048.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png'
    };
    return iconMap[iconName] || `https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/${iconName}`;
  }
} 