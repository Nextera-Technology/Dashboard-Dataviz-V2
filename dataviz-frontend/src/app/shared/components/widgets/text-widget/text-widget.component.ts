import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  DashboardWidget,
  WidgetAction,
} from "app/shared/services/dashboard.service";

@Component({
  selector: "app-text-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: "./text-widget.component.html",
  styleUrl: "./text-widget.component.scss",
})
export class TextWidgetComponent {
  @Input() widget!: DashboardWidget;
  isAnalysisExpanded = false;

  toggleAnalysis(): void {
    this.isAnalysisExpanded = !this.isAnalysisExpanded;
  }

  onActionClick(action: WidgetAction): void {
    console.log("Action clicked:", action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      "paragraph.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/paragraph.png",
      "excel.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/excel.png",
      "audience_4644048.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png",
    };
    return (
      iconMap[iconName] ||
      `https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/${iconName}`
    );
  }

  getAnalysisButtonText(): string {
    return this.isAnalysisExpanded ? "Masquer l'analyse" : "Voir l'analyse";
  }
}
