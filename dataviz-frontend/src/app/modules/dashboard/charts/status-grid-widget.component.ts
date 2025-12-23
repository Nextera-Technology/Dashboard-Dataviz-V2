import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusGridData {
  headers: string[];
  rows: StatusGridRow[];
}

export interface StatusGridRow {
  label: string;
  values: number[];
  color: string;
  borderColor: string;
}

@Component({
  selector: 'app-status-grid-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container" [class]="'widget-' + widget.cardSize">
      <div class="widget-header">
        <h3 class="widget-title">{{ widget.title }}</h3>
        <div class="widget-actions" *ngIf="widget.actions">
          <button 
            *ngFor="let action of widget.actions" 
            class="action-button"
            [class]="'action-' + action.type"
            [title]="action.title"
            (click)="handleAction(action)">
            <img [src]="getIconUrl(action.icon)" [alt]="action.title">
          </button>
        </div>
      </div>
      
      <div class="status-grid-container">
        <div class="status-grid-rowed">
          <!-- Header Row -->
          <div class="status-row header-row">
            <div class="status-category"></div>
            <div 
              *ngFor="let header of data.headers" 
              class="status-value-title">
              <strong>{{ header }}</strong>
            </div>
          </div>
          
          <!-- Data Rows -->
          <div 
            *ngFor="let row of data.rows" 
            class="status-row">
            <div class="status-category">{{ row.label }}</div>
            <div 
              *ngFor="let value of row.values; let i = index" 
              class="status-value"
              [style.background-color]="row.color"
              [style.border-left-color]="row.borderColor">
              {{ value }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .widget-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      position: relative;
      height: 100%;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .widget-title {
      font-family: 'Inter';
      font-size: 18px;
      font-weight: 600;
      color: #00454D;
      margin: 0;
      flex: 1;
    }

    .widget-actions {
      display: flex;
      gap: 5px;
    }

    .action-button {
      background: transparent;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .action-button:hover {
      transform: scale(1.1);
    }

    .action-button img {
      width: 18px;
      height: 18px;
    }

    .action-info:hover {
      background: #dda681;
    }

    .action-export:hover {
      background: #95cdd4;
    }

    .action-scope:hover {
      background: #bbaafa;
    }

    .status-grid-container {
      margin-top: 20px;
    }

    .status-grid-rowed {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .status-row {
      display: grid;
      grid-template-columns: 200px repeat(4, 1fr);
      gap: 10px;
      align-items: center;
    }

    .status-category {
      font-weight: bold;
      font-size: 15px;
      color: #15616D;
    }

    .status-value {
      padding: 10px;
      text-align: center;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      font-weight: 500;
      border-left: 4px solid;
    }

    .status-value-title {
      padding: 10px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }

    .header-row {
      color: #00454D;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .status-row {
        grid-template-columns: 150px repeat(4, 1fr);
        gap: 5px;
      }
      
      .status-category {
        font-size: 13px;
      }
      
      .status-value {
        font-size: 12px;
        padding: 8px;
      }
    }
  `]
})
export class StatusGridWidgetComponent implements OnInit {
  @Input() widget: any;
  
  data: StatusGridData = {
    headers: [],
    rows: []
  };

  ngOnInit() {
    if (this.widget?.data) {
      this.data = this.widget.data;
    }
  }

  handleAction(action: any) {
    if (action.url) {
      window.open(action.url, '_blank');
    } else if (action.action) {
      // Handle custom actions
      console.log('Action:', action.action);
    }
  }

  getIconUrl(icon: string): string {
    return `https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/${icon}`;
  }
} 