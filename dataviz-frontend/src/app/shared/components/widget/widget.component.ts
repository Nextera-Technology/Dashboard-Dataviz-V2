import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Widget, WIDGET_TYPES } from '../../models/widget.types';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card 
      class="widget-card"
      [ngClass]="getCardSizeClass()">
      
      <mat-card-header>
        <mat-card-title>{{ widget.title }}</mat-card-title>
        <mat-card-subtitle *ngIf="widget.data?.subtitle">
          {{ widget.data.subtitle }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Metric Widget -->
        <div *ngIf="widget.type === WIDGET_TYPES.METRIC" class="metric-widget">
          <div class="metric-value">{{ widget.data.value }}%</div>
          <div class="metric-trend" [ngClass]="getTrendClass()">
            <mat-icon>{{ getTrendIcon() }}</mat-icon>
            {{ Math.abs(widget.data.trend) }}%
          </div>
        </div>

        <!-- Chart Widget -->
        <div *ngIf="widget.type !== WIDGET_TYPES.METRIC" class="chart-widget">
          <div class="chart-placeholder">
            <mat-icon>insert_chart</mat-icon>
            <p>{{ widget.type.toUpperCase() }} Chart</p>
            <small>{{ widget.chartType || 'No chart type specified' }}</small>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .widget-card {
      height: 100%;
      transition: all 0.3s ease;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .widget-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .widget-card.small {
      min-height: 120px;
    }

    .widget-card.medium {
      min-height: 200px;
    }

    .widget-card.large {
      min-height: 300px;
    }

    .metric-widget {
      text-align: center;
      padding: 20px;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #15616D;
      margin-bottom: 8px;
    }

    .metric-trend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .metric-trend.positive {
      color: #2A9D8F;
    }

    .metric-trend.negative {
      color: #E76F51;
    }

    .metric-trend.neutral {
      color: #A0A0A0;
    }

    .chart-widget {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-placeholder {
      text-align: center;
      color: #666;
    }

    .chart-placeholder mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #15616D;
      margin-bottom: 8px;
    }

    .chart-placeholder p {
      margin: 8px 0 4px 0;
      font-weight: 500;
    }

    .chart-placeholder small {
      color: #999;
    }

    mat-card-header {
      padding-bottom: 0;
    }

    mat-card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    mat-card-subtitle {
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class WidgetComponent implements OnInit {
  @Input() widget!: Widget;
  
  WIDGET_TYPES = WIDGET_TYPES;
  Math = Math;

  ngOnInit(): void {
    if (!this.widget) {
      console.error('Widget input is required');
    }
  }

  getCardSizeClass(): string {
    return this.widget.cardSize || 'medium';
  }

  getTrendClass(): string {
    const trend = this.widget.data?.trend || 0;
    if (trend > 0) return 'positive';
    if (trend < 0) return 'negative';
    return 'neutral';
  }

  getTrendIcon(): string {
    const trend = this.widget.data?.trend || 0;
    if (trend > 0) return 'trending_up';
    if (trend < 0) return 'trending_down';
    return 'trending_flat';
  }
} 