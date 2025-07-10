import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardWidget, WidgetAction } from '../../services/dashboard.service';

@Component({
  selector: 'app-text-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="text-box" [style.background-color]="widget.data?.background || '#ffffff'">
      <!-- Action Buttons -->
      <div class="button-container" *ngIf="widget.actions && widget.actions.length > 0">
        <button 
          *ngFor="let action of widget.actions" 
          class="info-button"
          [class]="action.type"
          [title]="action.title"
          (click)="onActionClick(action)">
          <img [src]="getActionIcon(action.icon)" [alt]="action.title">
        </button>
      </div>

      <!-- Widget Content -->
      <div class="text-content">
        <h3 class="text-title">{{ widget.title }}</h3>
        
        <!-- Text Content -->
        <div class="text-body" [innerHTML]="widget.data?.content || ''"></div>
        
        <!-- Analysis Toggle (if available) -->
        <div class="analysis-section" *ngIf="widget.data?.analysis">
          <button 
            class="analysis-toggle" 
            (click)="toggleAnalysis()"
            [class.expanded]="isAnalysisExpanded">
            {{ getAnalysisButtonText() }}
          </button>
          
          <div class="analysis-content" [class.show]="isAnalysisExpanded">
            <div [innerHTML]="widget.data.analysis"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-box {
      position: relative;
      text-align: left;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      min-height: 200px;
      display: flex;
      flex-direction: column;
    }

    .text-box:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    /* Action Buttons */
    .button-container {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 5px;
      z-index: 10;
    }

    .info-button {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 4px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }

    .info-button:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.1);
    }

    .info-button.primary {
      background: rgba(21, 97, 109, 0.9);
    }

    .info-button.secondary {
      background: rgba(46, 158, 143, 0.9);
    }

    .info-button img {
      width: 16px;
      height: 16px;
    }

    /* Text Content */
    .text-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .text-title {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #00454D;
      margin: 0 0 15px 0;
      line-height: 1.3;
    }

    .text-body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      margin-bottom: 15px;
    }

    .text-body p {
      margin-bottom: 10px;
    }

    .text-body strong {
      color: #15616D;
      font-weight: 600;
    }

    .text-body ul, .text-body ol {
      margin: 10px 0;
      padding-left: 20px;
    }

    .text-body li {
      margin-bottom: 5px;
    }

    /* Analysis Section */
    .analysis-section {
      margin-top: 15px;
    }

    .analysis-toggle {
      background-color: #15616D;
      color: #fff;
      border: none;
      padding: 8px 14px;
      font-size: 14px;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .analysis-toggle:hover {
      background-color: #0E3F2D;
    }

    .analysis-toggle.expanded {
      background-color: #0E3F2D;
    }

    .analysis-content {
      display: none;
      margin-top: 15px;
      border-left: 4px solid #15616D;
      padding-left: 15px;
      animation: fadeIn 0.4s ease-in-out;
    }

    .analysis-content.show {
      display: block;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .analysis-content p {
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.5;
      color: #666;
    }

    .analysis-content strong {
      color: #15616D;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .text-box {
        padding: 15px;
        min-height: 150px;
      }

      .text-title {
        font-size: 16px;
      }

      .text-body {
        font-size: 13px;
      }

      .analysis-toggle {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  `]
})
export class TextWidgetComponent {
  @Input() widget!: DashboardWidget;
  isAnalysisExpanded = false;

  toggleAnalysis(): void {
    this.isAnalysisExpanded = !this.isAnalysisExpanded;
  }

  onActionClick(action: WidgetAction): void {
    console.log('Action clicked:', action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'paragraph.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/paragraph.png',
      'excel.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/excel.png',
      'audience_4644048.png': 'https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png'
    };
    return iconMap[iconName] || `https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/${iconName}`;
  }

  getAnalysisButtonText(): string {
    return this.isAnalysisExpanded ? 'Masquer l\'analyse' : 'Voir l\'analyse';
  }
} 