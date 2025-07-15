import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface SimpleTableData {
  subtitle?: string;
  headers: string[];
  values: number[];
  background?: string;
}

@Component({
  selector: "app-simple-table-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./simple-table-widget.component.html",
  styleUrl: "./simple-table-widget.component.scss",
})
export class SimpleTableWidgetComponent implements OnInit {
  @Input() widget: any;

  data: SimpleTableData = {
    headers: [],
    values: [],
  };

  ngOnInit() {
    if (this.widget?.data) {
      this.data = this.widget.data;
    }
  }

  handleAction(action: any) {
    if (action.url) {
      window.open(action.url, "_blank");
    } else if (action.action) {
      // Handle custom actions
      console.log("Action:", action.action);
    }
  }

  getIconUrl(icon: string): string {
    return `https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/${icon}`;
  }
}
