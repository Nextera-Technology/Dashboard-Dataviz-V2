import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WidgetComponent } from './widget.component';
import { Widget, WidgetType, ChartType } from '../../models/widget.types';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, WidgetComponent],
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
      
      <div class="chart-content">
        <div class="chart-container" #chartContainer>
          <!-- Pie / Donut Chart -->
          <div *ngIf="widget.config.chartType === 'pie' || widget.config.chartType === 'donut'" class="pie-chart">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <g transform="translate(100, 100)">
                <ng-container *ngFor="let slice of getPieSlices(); let i = index">
                  <path 
                    [attr.d]="slice.path"
                    [attr.fill]="slice.color"
                    [attr.stroke]="'white'"
                    [attr.stroke-width]="2"
                    class="pie-slice"
                    (mouseenter)="onSliceHover(slice, $event)"
                    (mouseleave)="onSliceLeave()">
                  </path>
                </ng-container>
                <circle cx="0" cy="0" r="30" fill="white" class="center-circle"></circle>
              </g>
            </svg>
            
            <!-- Legend -->
            <div class="chart-legend">
              <div 
                *ngFor="let item of widget.config.data?.series; let i = index"
                class="legend-item"
                (mouseenter)="onLegendHover(i)"
                (mouseleave)="onLegendLeave()">
                <div class="legend-color" [style.background-color]="item.color"></div>
                <span class="legend-label">{{ item.name }}</span>
                <span class="legend-value">{{ item.value }}%</span>
              </div>
            </div>
          </div>

          <!-- Bar Chart -->
          <div *ngIf="widget.config.chartType === 'bar'" class="bar-chart">
            <div class="bar-container">
              <div 
                *ngFor="let item of widget.config.data?.series; let i = index"
                class="bar-item">
                <div class="bar-label">{{ item.name }}</div>
                <div class="bar-wrapper">
                  <div 
                    class="bar"
                    [style.width.%]="item.value"
                    [style.background-color]="item.color">
                  </div>
                  <span class="bar-value">{{ item.value }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Line Chart -->
          <div *ngIf="widget.config.chartType === 'line'" class="line-chart">
            <svg viewBox="0 0 300 150" class="line-svg">
              <polyline 
                [attr.points]="getLinePoints()"
                fill="none"
                stroke="#1976d2"
                stroke-width="2"
                class="line-path">
              </polyline>
              <circle 
                *ngFor="let point of getLinePointsArray()"
                [attr.cx]="point.x"
                [attr.cy]="point.y"
                r="4"
                fill="#1976d2"
                class="line-point">
              </circle>
            </svg>
          </div>
        </div>

        <!-- Chart Controls -->
        <div class="chart-controls" *ngIf="showControls">
          <button mat-icon-button (click)="toggleFullscreen()" matTooltip="Fullscreen">
            <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
          </button>
          <button mat-icon-button (click)="exportChart()" matTooltip="Export">
            <mat-icon>download</mat-icon>
          </button>
        </div>
      </div>
    </app-widget>
  `,
  styles: [`
    .chart-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 16px;
    }

    .chart-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    /* Pie Chart Styles */
    .pie-chart {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .pie-svg {
      width: 200px;
      height: 200px;
    }

    .pie-slice {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .pie-slice:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }

    .center-circle {
      pointer-events: none;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .legend-item:hover {
      background-color: #f5f5f5;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      font-size: 12px;
      color: #333;
    }

    .legend-value {
      font-size: 12px;
      font-weight: 600;
      color: #666;
    }

    /* Bar Chart Styles */
    .bar-chart {
      width: 100%;
      height: 100%;
    }

    .bar-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
    }

    .bar-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bar-label {
      width: 80px;
      font-size: 12px;
      color: #666;
      text-align: right;
    }

    .bar-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bar {
      height: 20px;
      border-radius: 10px;
      transition: all 0.3s ease;
      position: relative;
    }

    .bar:hover {
      opacity: 0.8;
      transform: scaleY(1.1);
    }

    .bar-value {
      font-size: 12px;
      font-weight: 600;
      color: #333;
      min-width: 30px;
    }

    /* Line Chart Styles */
    .line-chart {
      width: 100%;
      height: 100%;
    }

    .line-svg {
      width: 100%;
      height: 100%;
    }

    .line-path {
      transition: all 0.3s ease;
    }

    .line-point {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .line-point:hover {
      /* highlight effect can be added here if needed */
    }

    /* Chart Controls */
    .chart-controls {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .pie-svg {
        width: 150px;
        height: 150px;
      }
      
      .bar-label {
        width: 60px;
        font-size: 10px;
      }
      
      .bar {
        height: 16px;
      }
    }
  `]
})
export class ChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  @Input() isSelected = false;
  @Input() isDragging = false;
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  showControls = false;
  isFullscreen = false;
  hoveredSlice: any = null;

  ngOnInit(): void {
    // Initialize chart
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  getPieSlices(): any[] {
    const series = this.widget.config.data?.series;
    if (!series || series.length === 0) return [];

    const total = series.reduce((sum: number, item: any) => sum + item.value, 0);
    let currentAngle = -90; // Start from top

    return series.map((item: any) => {
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = Math.cos(startAngle * Math.PI / 180);
      const y1 = Math.sin(startAngle * Math.PI / 180);
      const x2 = Math.cos(endAngle * Math.PI / 180);
      const y2 = Math.sin(endAngle * Math.PI / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const path = [
        `M ${x1 * 80} ${y1 * 80}`,
        `A 80 80 0 ${largeArcFlag} 1 ${x2 * 80} ${y2 * 80}`,
        'L 0 0'
      ].join(' ');

      currentAngle += angle;
      
      return {
        path,
        color: item.color,
        value: item.value,
        name: item.name
      };
    });
  }

  getLinePoints(): string {
    const series = this.widget.config.data?.series;
    if (!series || series.length === 0) return '';

    const maxValue = Math.max(...series.map((item: any) => item.value));
    const points = series.map((item: any, index: number) => {
      const x = (index / (series.length - 1)) * 280 + 10;
      const y = 140 - (item.value / maxValue) * 120;
      return `${x},${y}`;
    });

    return points.join(' ');
  }

  getLinePointsArray(): any[] {
    const series = this.widget.config.data?.series;
    if (!series || series.length === 0) return [];

    const maxValue = Math.max(...series.map((item: any) => item.value));
    return series.map((item: any, index: number) => {
      const x = (index / (series.length - 1)) * 280 + 10;
      const y = 140 - (item.value / maxValue) * 120;
      return { x, y, value: item.value };
    });
  }

  onSliceHover(slice: any, event: any): void {
    this.hoveredSlice = slice;
    // Add hover effects
  }

  onSliceLeave(): void {
    this.hoveredSlice = null;
  }

  onLegendHover(index: number): void {
    // Highlight corresponding slice
  }

  onLegendLeave(): void {
    // Remove highlight
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    // Implement fullscreen logic
  }

  exportChart(): void {
    // Implement export logic
    console.log('Exporting chart...');
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