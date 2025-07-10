import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Section, Widget } from '../../models/widget.types';
import { WidgetComponent } from '../widget/widget.component';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CommonModule, MatCardModule, WidgetComponent],
  template: `
    <div class="section-container" [style.background-color]="section.background">
      <div class="section-header">
        <h2 class="section-title">{{ section.title }}</h2>
      </div>
      
      <div class="widgets-grid">
        <app-widget 
          *ngFor="let widget of visibleWidgets; trackBy: trackByWidget"
          [widget]="widget"
          class="widget-item"
          [ngClass]="getWidgetSizeClass(widget)">
        </app-widget>
      </div>
    </div>
  `,
  styles: [`
    .section-container {
      margin-bottom: 2rem;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #15616D;
    }

    .widgets-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .widget-item {
      height: 100%;
    }

    .widget-item.small {
      grid-column: span 1;
    }

    .widget-item.medium {
      grid-column: span 2;
    }

    .widget-item.large {
      grid-column: span 3;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .widgets-grid {
        grid-template-columns: 1fr;
      }
      
      .widget-item.medium,
      .widget-item.large {
        grid-column: span 1;
      }
    }

    @media (min-width: 769px) and (max-width: 1200px) {
      .widgets-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
    }
  `]
})
export class SectionComponent implements OnInit {
  @Input() section!: Section;
  
  visibleWidgets: Widget[] = [];

  ngOnInit(): void {
    if (!this.section) {
      console.error('Section input is required');
      return;
    }
    
    // Filter visible widgets and sort by scope
    this.visibleWidgets = this.section.widgets
      .filter(widget => widget.visible)
      .sort((a, b) => parseInt(a.scope) - parseInt(b.scope));
  }

  trackByWidget(index: number, widget: Widget): string {
    return widget.name;
  }

  getWidgetSizeClass(widget: Widget): string {
    return widget.cardSize || 'medium';
  }
} 