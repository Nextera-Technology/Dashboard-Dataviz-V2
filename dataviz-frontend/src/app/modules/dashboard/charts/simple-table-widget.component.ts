import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SimpleTableData {
  subtitle?: string;
  headers: string[];
  values: number[];
  background?: string;
}

@Component({
  selector: 'app-simple-table-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container" [class]="'widget-' + widget.cardSize" [style.background-color]="data.background">
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
      
      <div class="table-container">
        <p *ngIf="data.subtitle" class="table-subtitle">{{ data.subtitle }}</p>
        
        <table class="simple-table">
          <thead>
            <tr>
              <th *ngFor="let header of data.headers">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td *ngFor="let value of data.values" class="table-value">
                <strong>{{ value }}%</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .widget-container {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      position: relative;
      height: 100%;
      text-align: center;
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
      text-align: left;
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

    .table-container {
      margin-top: 15px;
    }

    .table-subtitle {
      color: #1E9180;
      font-size: 16px;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .simple-table {
      margin: 0 auto;
      text-align: center;
      border-collapse: collapse;
      width: 100%;
    }

    .simple-table th {
      font-size: 15px;
      color: #6B7280;
      padding: 10px 15px;
      font-weight: normal;
    }

    .simple-table td {
      padding: 10px 15px;
    }

    .table-value {
      font-size: 18px;
      color: #159E8E;
      font-weight: 700;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .widget-title {
        font-size: 16px;
      }
      
      .table-subtitle {
        font-size: 14px;
      }
      
      .simple-table th {
        font-size: 13px;
        padding: 8px 10px;
      }
      
      .table-value {
        font-size: 16px;
        padding: 8px 10px;
      }
    }
  `]
})
export class SimpleTableWidgetComponent implements OnInit {
  @Input() widget: any;
  
  data: SimpleTableData = {
    headers: [],
    values: []
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