import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WidgetComponent } from './widget.component';
import { Widget, WidgetType } from '../../models/widget.types';

@Component({
  selector: 'app-metric-card-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, WidgetComponent],
  template: `
    <app-widget 
      [widget]="widget"
      [isSelected]="isSelected"
      [isDragging]="isDragging"
      (edit)="onEdit($event)"
      (duplicate)="onDuplicate($event)"
      (move)="onMove($event)"
      (delete)="onDelete($event)"
      (click)="onClick($event)"
      (dragStart)="onDragStart($event)"
      (dragEnd)="onDragEnd($event)">
      
      <div class="metric-content">
        <div class="metric-value">
          <span class="value">{{ getCurrentValue() }}</span>
          <span class="unit">%</span>
        </div>
        
        <div class="metric-chart" *ngIf="widget.config.data?.values">
          <div class="chart-container">
            <div 
              *ngFor="let value of widget.config.data.values; let i = index"
              class="chart-bar"
              [style.height.%]="value"
              [style.background-color]="getBarColor(i)"
              [title]="widget.config.data.labels[i] + ': ' + value + '%'">
            </div>
          </div>
          <div class="chart-labels">
            <span 
              *ngFor="let label of widget.config.data.labels"
              class="chart-label">
              {{ label }}
            </span>
          </div>
        </div>
        
        <div class="metric-trend" *ngIf="getTrend() !== 0">
          <mat-icon [class.trend-up]="getTrend() > 0" [class.trend-down]="getTrend() < 0">
            {{ getTrend() > 0 ? 'trending_up' : 'trending_down' }}
          </mat-icon>
          <span [class.trend-up]="getTrend() > 0" [class.trend-down]="getTrend() < 0">
            {{ Math.abs(getTrend()) }}%
          </span>
        </div>
      </div>
    </app-widget>
  `,
  styles: [`
    .metric-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 16px;
    }

    .metric-value {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .value {
      font-size: 32px;
      font-weight: 700;
      color: #1976d2;
      line-height: 1;
    }

    .unit {
      font-size: 16px;
      color: #666;
      font-weight: 500;
    }

    .metric-chart {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chart-container {
      display: flex;
      align-items: end;
      gap: 4px;
      height: 60px;
      padding: 8px 0;
    }

    .chart-bar {
      flex: 1;
      min-width: 8px;
      border-radius: 2px 2px 0 0;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .chart-bar:hover {
      opacity: 0.8;
      transform: scaleY(1.05);
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #666;
    }

    .chart-label {
      flex: 1;
      text-align: center;
      font-weight: 500;
    }

    .metric-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .trend-up {
      color: #4caf50;
    }

    .trend-down {
      color: #f44336;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .value {
        font-size: 24px;
      }
      
      .unit {
        font-size: 14px;
      }
      
      .chart-container {
        height: 40px;
      }
    }
  `]
})
export class MetricCardWidgetComponent implements OnInit {
  @Input() widget!: Widget;
  @Input() isSelected = false;
  @Input() isDragging = false;

  Math = Math;

  ngOnInit(): void {
    // Initialize if needed
  }

  getCurrentValue(): number {
    const values = this.widget.config.data?.values;
    if (values && values.length > 0) {
      return values[values.length - 1];
    }
    return 0;
  }

  getTrend(): number {
    const values = this.widget.config.data?.values;
    if (values && values.length >= 2) {
      const current = values[values.length - 1];
      const previous = values[values.length - 2];
      return current - previous;
    }
    return 0;
  }

  getBarColor(index: number): string {
    const colors = ['#1976d2', '#42a5f5', '#90caf9', '#bbdefb'];
    return colors[index % colors.length];
  }

  onEdit(widget: Widget): void {
    // Handle edit
  }

  onDuplicate(widget: Widget): void {
    // Handle duplicate
  }

  onMove(widget: Widget): void {
    // Handle move
  }

  onDelete(widget: Widget): void {
    // Handle delete
  }

  onClick(widget: Widget): void {
    // Handle click
  }

  onDragStart(widget: Widget): void {
    // Handle drag start
  }

  onDragEnd(widget: Widget): void {
    // Handle drag end
  }
} 