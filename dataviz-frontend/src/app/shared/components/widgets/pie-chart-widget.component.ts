import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardWidget, WidgetAction } from '../../services/dashboard.service';

declare var am5: any;
declare var am5percent: any;

@Component({
  selector: 'app-pie-chart-widget',
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
        
        <!-- Manual Legend -->
        <div class="manual-legend" *ngIf="widget.data?.series">
          <div 
            *ngFor="let item of widget.data.series" 
            class="legend-item">
            <span class="legend-color" [style.background-color]="item.color"></span>
            <span class="legend-label">
              {{ item.name }} 
              <span class="legend-value" [style.color]="item.color">
                <strong>{{ item.value }} ({{ item.percentage }}%)</strong>
              </span>
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
  `]
})
export class PieChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget!: DashboardWidget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private root: any;
  private chart: any;
  private series: any;

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
    // Create root element
    this.root = am5.Root.new(this.chartContainer.nativeElement);

    // Set themes
    this.root.setThemes([am5.Theme.new(this.root)]);

    // Create chart
    this.chart = this.root.container.children.push(
      am5percent.PieChart.new(this.root, {
        layout: this.root.verticalLayout,
        innerRadius: am5.percent(50)
      })
    );

    // Create series
    this.series = this.chart.series.push(
      am5percent.PieSeries.new(this.root, {
        name: "Series",
        categoryField: "name",
        valueField: "value",
        legendLabelText: "{name}",
        legendValueText: "{valuePercentTotal.formatNumber('#.0')}%"
      })
    );

    // Set data
    const data = this.widget.data.series.map((item: any) => ({
      name: item.name,
      value: item.value,
      color: am5.color(item.color)
    }));

    this.series.data.setAll(data);

    // Configure series appearance
    this.series.slices.template.setAll({
      tooltipText: "{name}: {valuePercentTotal.formatNumber('#.0')}%",
      stroke: am5.color(0xffffff),
      strokeWidth: 2
    });

    // Set colors
    this.series.set("colors", am5.ColorSet.new(this.root, {
      colors: data.map((item: any) => item.color)
    }));

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

    legend.data.setAll(this.series.dataItems);

    // Set up animations
    this.series.appear(1000, 100);
  }

  onActionClick(action: WidgetAction): void {
    console.log('Action clicked:', action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    // Return placeholder icon URLs - in real app, these would be actual icons
    const iconMap: { [key: string]: string } = {
      'paragraph.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/paragraph.png',
      'excel.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/excel.png',
      'audience_4644048.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png'
    };
    
    return iconMap[iconName] || `https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/${iconName}`;
  }
} 