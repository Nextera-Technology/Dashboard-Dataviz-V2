import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MetricCardWidgetComponent } from './metric-card-widget.component';
import { ChartWidgetComponent } from './chart-widget.component';
import { Widget, WidgetType } from '../../models/widget.types';

@Component({
  selector: 'app-widget-factory',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MetricCardWidgetComponent,
    ChartWidgetComponent
  ],
  template: `
    <!-- Metric Card Widget -->
    <app-metric-card-widget
      *ngIf="widget.type === WidgetType.METRIC_CARD"
      [widget]="widget"
      [isSelected]="isSelected"
      [isDragging]="isDragging"
      (edit)="onEdit(widget)"
      (duplicate)="onDuplicate(widget)"
      (move)="onMove(widget)"
      (delete)="onDelete(widget)"
      (click)="onClick(widget)"
      (dragStart)="onDragStart(widget)"
      (dragEnd)="onDragEnd(widget)">
    </app-metric-card-widget>

    <!-- Chart Widgets -->
    <app-chart-widget
      *ngIf="isChartWidget(widget.type)"
      [widget]="widget"
      [isSelected]="isSelected"
      [isDragging]="isDragging"
      (edit)="onEdit(widget)"
      (duplicate)="onDuplicate(widget)"
      (move)="onMove(widget)"
      (delete)="onDelete(widget)"
      (click)="onClick(widget)"
      (dragStart)="onDragStart(widget)"
      (dragEnd)="onDragEnd(widget)">
    </app-chart-widget>

    <!-- Placeholder for other widget types -->
    <div 
      *ngIf="!isSupportedWidget(widget.type)"
      class="unsupported-widget"
      [style.grid-column]="'span ' + widget.config.dimensions?.span"
      [style.grid-row]="'span ' + (widget.config.dimensions?.height || 1)">
      <div class="placeholder-content">
        <mat-icon>widgets</mat-icon>
        <h3>{{ widget.config.title || 'Unsupported Widget' }}</h3>
        <p>Widget type "{{ widget.type }}" is not yet supported.</p>
      </div>
    </div>
  `,
  styles: [`
    .unsupported-widget {
      background: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #666;
    }

    .placeholder-content {
      text-align: center;
      padding: 20px;
    }

    .placeholder-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .placeholder-content h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #333;
    }

    .placeholder-content p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class WidgetFactoryComponent {
  @Input() widget!: Widget;
  @Input() isSelected = false;
  @Input() isDragging = false;

  @Output() edit = new EventEmitter<Widget>();
  @Output() duplicate = new EventEmitter<Widget>();
  @Output() move = new EventEmitter<Widget>();
  @Output() delete = new EventEmitter<Widget>();
  @Output() click = new EventEmitter<Widget>();
  @Output() dragStart = new EventEmitter<Widget>();
  @Output() dragEnd = new EventEmitter<Widget>();

  WidgetType = WidgetType;

  isChartWidget(type: WidgetType): boolean {
    return [
      WidgetType.PIE_CHART,
      WidgetType.BAR_CHART,
      WidgetType.LINE_CHART
    ].includes(type);
  }

  isSupportedWidget(type: WidgetType): boolean {
    return [
      WidgetType.METRIC_CARD,
      WidgetType.PIE_CHART,
      WidgetType.BAR_CHART,
      WidgetType.LINE_CHART
    ].includes(type);
  }

  onEdit(widget: Widget): void {
    this.edit.emit(widget);
  }

  onDuplicate(widget: Widget): void {
    this.duplicate.emit(widget);
  }

  onMove(widget: Widget): void {
    this.move.emit(widget);
  }

  onDelete(widget: Widget): void {
    this.delete.emit(widget);
  }

  onClick(widget: Widget): void {
    this.click.emit(widget);
  }

  onDragStart(widget: Widget): void {
    this.dragStart.emit(widget);
  }

  onDragEnd(widget: Widget): void {
    this.dragEnd.emit(widget);
  }
} 