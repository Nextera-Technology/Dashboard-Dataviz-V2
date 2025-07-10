import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSection, DashboardWidget } from '../../services/dashboard.service';
import { MetricWidgetComponent } from '../widgets/metric-widget.component';
import { PieChartWidgetComponent } from '../widgets/pie-chart-widget.component';
import { BarChartWidgetComponent } from '../widgets/bar-chart-widget.component';
import { ColumnChartWidgetComponent } from '../widgets/column-chart-widget.component';
import { LineChartWidgetComponent } from '../widgets/line-chart-widget.component';
import { SankeyChartWidgetComponent } from '../widgets/sankey-chart-widget.component';
import { TextWidgetComponent } from '../widgets/text-widget.component';
import { MapWidgetComponent } from '../widgets/map-widget.component';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [
    CommonModule,
    MetricWidgetComponent,
    PieChartWidgetComponent,
    BarChartWidgetComponent,
    ColumnChartWidgetComponent,
    LineChartWidgetComponent,
    SankeyChartWidgetComponent,
    TextWidgetComponent,
    MapWidgetComponent
  ],
  template: `
    <div class="section" [style.background-color]="section.background">
      <div class="section-header">
        <h2>{{ section.title }}</h2>
      </div>
      
      <div class="widgets-grid">
        <ng-container *ngFor="let widget of visibleWidgets">
          <!-- Metric Widget -->
          <app-metric-widget 
            *ngIf="widget.type === 'metric'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-metric-widget>

          <!-- Pie Chart Widget -->
          <app-pie-chart-widget 
            *ngIf="widget.type === 'pie'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-pie-chart-widget>

          <!-- Bar Chart Widget -->
          <app-bar-chart-widget 
            *ngIf="widget.type === 'bar'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-bar-chart-widget>

          <!-- Column Chart Widget -->
          <app-column-chart-widget 
            *ngIf="widget.type === 'column'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-column-chart-widget>

          <!-- Line Chart Widget -->
          <app-line-chart-widget 
            *ngIf="widget.type === 'line'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-line-chart-widget>

          <!-- Sankey Chart Widget -->
          <app-sankey-chart-widget 
            *ngIf="widget.type === 'sankey'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-sankey-chart-widget>

          <!-- Text Widget -->
          <app-text-widget 
            *ngIf="widget.type === 'text'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-text-widget>

          <!-- Map Widget -->
          <app-map-widget 
            *ngIf="widget.type === 'map'"
            [widget]="widget"
            class="widget"
            [class.widget-small]="widget.size === 'small'"
            [class.widget-medium]="widget.size === 'medium'"
            [class.widget-large]="widget.size === 'large'">
          </app-map-widget>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .section {
      margin-bottom: 2rem;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .widgets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .widget {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .widget:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .widget-small {
      grid-column: span 1;
    }

    .widget-medium {
      grid-column: span 2;
    }

    .widget-large {
      grid-column: span 3;
    }

    @media (max-width: 768px) {
      .widgets-grid {
        grid-template-columns: 1fr;
      }
      
      .widget-medium,
      .widget-large {
        grid-column: span 1;
      }
    }
  `]
})
export class SectionComponent implements OnInit {
  @Input() section!: DashboardSection;
  
  visibleWidgets: DashboardWidget[] = [];

  ngOnInit(): void {
    this.updateVisibleWidgets();
  }

  ngOnChanges(): void {
    this.updateVisibleWidgets();
  }

  private updateVisibleWidgets(): void {
    if (this.section && this.section.widgets) {
      this.visibleWidgets = this.section.widgets
        .filter((widget: DashboardWidget) => widget.visible)
        .sort((a: DashboardWidget, b: DashboardWidget) => {
          // Sort by widget order if available, otherwise by title
          const aOrder = parseInt(a.id) || 0;
          const bOrder = parseInt(b.id) || 0;
          return aOrder - bOrder;
        });
    }
  }
} 