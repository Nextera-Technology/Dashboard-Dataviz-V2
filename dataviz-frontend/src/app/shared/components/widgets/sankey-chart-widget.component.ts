import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardWidget, WidgetAction } from '../../services/dashboard.service';

declare var am5: any;
declare var am5flow: any;

@Component({
  selector: 'app-sankey-chart-widget',
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
        <div class="manual-legend" *ngIf="widget.data?.legend">
          <div 
            *ngFor="let item of widget.data.legend" 
            class="legend-item">
            <span class="legend-color" [style.background-color]="item.color"></span>
            <span class="legend-label">
              {{ item.name }}
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
      height: 400px;
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
        height: 300px;
      }

      .legend-item {
        font-size: 12px;
      }
    }
  `]
})
export class SankeyChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget!: DashboardWidget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private root: any;
  private chart: any;

  ngOnInit(): void {
    if (this.widget.data?.nodes && this.widget.data?.links) {
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
      am5flow.Sankey.new(this.root, {
        orientation: 'horizontal',
        nodeWidth: 20,
        nodePadding: 10,
        linkOpacity: 0.5
      })
    );

    // Only set links data
    this.chart.data.setAll(this.widget.data.links);

    // Style nodes and links
    this.chart.nodes.template.setAll({
      fill: am5.color('#67b7dc'),
      stroke: am5.color('#15616D'),
      strokeWidth: 2
    });

    this.chart.links.template.setAll({
      fill: am5.color('#67b7dc'),
      stroke: am5.color('#15616D'),
      strokeWidth: 1
    });

    this.chart.appear(1000, 100);
  }

  private showFallbackContent(): void {
    const container = this.chartContainer.nativeElement;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
        <h4 style="margin-bottom: 15px; color: #15616D;">${this.widget.title}</h4>
        <div style="text-align: center; line-height: 1.6;">
          <p><strong>Flow Data:</strong></p>
          ${this.widget.data.links.map((link: any) => 
            `<p>${link.from} → ${link.to}: ${link.value}</p>`
          ).join('')}
        </div>
        <p style="margin-top: 15px; font-size: 12px; color: #999;">
          Sankey chart visualization will be available soon
        </p>
      </div>
    `;
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