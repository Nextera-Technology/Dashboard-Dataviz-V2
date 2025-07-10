import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSection, DashboardWidget } from '../../services/dashboard.service';
import { MetricWidgetComponent } from '../widgets/metric-widget.component';
import { PieChartWidgetComponent } from '../widgets/pie-chart-widget.component';
import { BarChartWidgetComponent } from '../widgets/bar-chart-widget.component';
import { ColumnChartWidgetComponent } from '../widgets/column-chart-widget.component';
import { LineChartWidgetComponent } from '../widgets/line-chart-widget.component';
import { SankeyChartWidgetComponent } from '../widgets/sankey-chart-widget.component';
import { TextWidgetComponent } from '../widgets/text-widget.component';
import { StatusGridWidgetComponent } from '../widgets/status-grid-widget.component';
import { SimpleTableWidgetComponent } from '../widgets/simple-table-widget.component';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CommonModule, MetricWidgetComponent, PieChartWidgetComponent, BarChartWidgetComponent, ColumnChartWidgetComponent, LineChartWidgetComponent, SankeyChartWidgetComponent, TextWidgetComponent, StatusGridWidgetComponent, SimpleTableWidgetComponent],
  template: `
    <div class="section-container">
      <!-- Section Header -->
      <h2 class="section-title">{{ section.title }}</h2>
      
      <!-- Widgets Grid -->
      <div class="widgets-grid" [ngClass]="getGridClass()">
        <ng-container *ngFor="let widget of visibleWidgets; trackBy: trackByWidget">
          <!-- Metric Widget -->
          <app-metric-widget 
            *ngIf="widget.type === 'metric'"
            [widget]="widget"
            class="widget-item">
          </app-metric-widget>
          
          <!-- Pie Chart Widget -->
          <app-pie-chart-widget 
            *ngIf="widget.type === 'pie'"
            [widget]="widget"
            class="widget-item">
          </app-pie-chart-widget>

          <!-- Bar Chart Widget -->
          <app-bar-chart-widget 
            *ngIf="widget.type === 'bar'"
            [widget]="widget"
            class="widget-item">
          </app-bar-chart-widget>

          <!-- Column Chart Widget -->
          <app-column-chart-widget 
            *ngIf="widget.type === 'column'"
            [widget]="widget"
            class="widget-item">
          </app-column-chart-widget>

          <!-- Line Chart Widget -->
          <app-line-chart-widget 
            *ngIf="widget.type === 'line'"
            [widget]="widget"
            class="widget-item">
          </app-line-chart-widget>

          <!-- Sankey Chart Widget -->
          <app-sankey-chart-widget 
            *ngIf="widget.type === 'sankey'"
            [widget]="widget"
            class="widget-item">
          </app-sankey-chart-widget>

          <!-- Text Widget -->
          <app-text-widget 
            *ngIf="widget.type === 'text'"
            [widget]="widget"
            class="widget-item">
          </app-text-widget>

          <!-- Status Grid Widget -->
          <app-status-grid-widget 
            *ngIf="widget.type === 'status-grid'"
            [widget]="widget"
            class="widget-item">
          </app-status-grid-widget>

          <!-- Simple Table Widget -->
          <app-simple-table-widget 
            *ngIf="widget.type === 'simple-table'"
            [widget]="widget"
            class="widget-item">
          </app-simple-table-widget>
          
          <!-- Placeholder for other widget types -->
          <div 
            *ngIf="widget.type !== 'metric' && widget.type !== 'pie' && widget.type !== 'bar' && widget.type !== 'column' && widget.type !== 'line' && widget.type !== 'sankey' && widget.type !== 'text' && widget.type !== 'status-grid' && widget.type !== 'simple-table'"
            class="widget-placeholder"
            [style.grid-column]="getWidgetSpan(widget.cardSize)">
            <div class="placeholder-content">
              <h3>{{ widget.title }}</h3>
              <p>{{ widget.type.toUpperCase() }} Widget</p>
              <small>Coming soon...</small>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .section-container {
      margin-bottom: 30px;
    }

    .section-title {
      color: #15616D;
      margin-bottom: 20px;
      font-size: 24px;
      font-weight: 600;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Grid Layouts */
    .widgets-grid {
      display: grid;
      gap: 20px;
    }

    .widgets-grid.grid3 {
      grid-template-columns: repeat(3, 1fr);
    }

    .widgets-grid.grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .widgets-grid.grid2 {
      grid-template-columns: repeat(2, 1fr);
    }

    .widgets-grid.grid4 {
      grid-template-columns: repeat(4, 1fr);
    }

    .widgets-grid.grid0 {
      grid-template-columns: repeat(4, 1fr);
    }

    .widget-item {
      height: 100%;
    }

    /* Widget Span Classes */
    .widget-item.small {
      grid-column: span 1;
    }

    .widget-item.medium {
      grid-column: span 2;
    }

    .widget-item.large {
      grid-column: span 3;
    }

    /* Placeholder for other widget types */
    .widget-placeholder {
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      min-height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-content h3 {
      color: #15616D;
      margin: 0 0 10px 0;
      font-size: 16px;
    }

    .placeholder-content p {
      color: #666;
      margin: 0 0 5px 0;
      font-size: 14px;
    }

    .placeholder-content small {
      color: #999;
      font-size: 12px;
    }

    /* Responsive Design */
    @media (max-width: 1000px) {
      .widgets-grid.grid3,
      .widgets-grid.grid,
      .widgets-grid.grid2 {
        grid-template-columns: 1fr;
      }

      .widgets-grid.grid4,
      .widgets-grid.grid0 {
        grid-template-columns: repeat(2, 1fr);
      }

      .widget-item.medium,
      .widget-item.large {
        grid-column: span 1;
      }
    }

    @media (max-width: 640px) {
      .widgets-grid.grid4,
      .widgets-grid.grid0 {
        grid-template-columns: 1fr;
      }

      .section-title {
        font-size: 20px;
      }
    }
  `]
})
export class SectionComponent {
  @Input() section!: DashboardSection;

  get visibleWidgets(): DashboardWidget[] {
    return this.section.widgets
      .filter(widget => widget.visible)
      .sort((a, b) => parseInt(a.scope) - parseInt(b.scope));
  }

  getGridClass(): string {
    // Determine grid class based on number of widgets or section name
    const widgetCount = this.visibleWidgets.length;
    
    if (this.section.name === 'poursuite-etudes') {
      return 'grid3'; // First section has 3 widgets in a row
    }
    
    if (widgetCount <= 2) return 'grid';
    if (widgetCount === 3) return 'grid3';
    if (widgetCount === 4) return 'grid4';
    if (widgetCount > 4) return 'grid0';
    
    return 'grid';
  }

  getWidgetSpan(cardSize: string): string {
    switch (cardSize) {
      case 'small': return 'span 1';
      case 'medium': return 'span 2';
      case 'large': return 'span 3';
      default: return 'span 1';
    }
  }

  trackByWidget(index: number, widget: DashboardWidget): string {
    return widget.id;
  }
} 