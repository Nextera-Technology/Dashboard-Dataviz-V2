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
  templateUrl: "./status-grid-widget.component.html",
  styleUrl: "./status-grid-widget.component.scss",
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