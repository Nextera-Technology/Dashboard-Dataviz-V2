import {
  Component,
  Input,
  HostListener,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  DashboardWidget,
  WidgetAction,
} from "app/shared/services/dashboard.service";

@Component({
  selector: "app-metric-widget",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="chart-box"
      [style.background-color]="widget?.background || '#ffffff'"
      #chartBoxRef
    >
      <div class="button-container">
        <button class="info-button primary" (click)="onActionClick('info')">
          <img [src]="getActionIcon('paragraph.png')" alt="Info" />
        </button>
        <button class="info-button secondary" (click)="onActionClick('export')">
          <img [src]="getActionIcon('excel.png')" alt="Export" />
        </button>
        <button
          class="info-button secondary"
          (click)="onActionClick('audience')"
        >
          <img [src]="getActionIcon('audience_4644048.png')" alt="Audience" />
        </button>
      </div>

      <div class="metric-content">
        <h3 class="metric-title">{{ widget.title }}</h3>
        <div class="flex w-full gap-2 justify-center items-center metric-items-container">
          <div
            class="block metric-item"
            *ngFor="let item of widget.data"
            [ngClass]="getMetricItemClass()"
          >
            <div class="metric-subtitle" *ngIf="item?.name">
              {{ item?.name }}
            </div>
            <div class="metric-value">{{ item?.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chart-box {
        position: relative;
        text-align: center;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        min-height: 150px;
        display: flex;
        flex-direction: column;
        overflow: hidden; /* Added to prevent content overflow during resize */
      }

      .chart-box:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      /* Metric Content */
      .metric-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-top: 20px;
      }

      .metric-title {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 0 0 15px 0;
        line-height: 1.3;
      }

      /* Container for metric items - Key for wrapping! */
      .metric-items-container {
        flex-wrap: wrap; /* Allows items to wrap to the next line */
        gap: 1rem; /* Adjust gap between items as needed */
      }

      .metric-item {
        /* This ensures each metric block takes up an even amount of space
           and allows for wrapping. Adjust 'flex-basis' as needed based on
           how many items you want per row typically before wrapping.
           For example, calc(33% - 1rem) would aim for 3 per row with a 1rem gap. */
        flex: 1 1 auto; /* Allows items to grow and shrink, and defines a preferred size */
        min-width: 100px; /* Minimum width for each item before wrapping or shrinking too much */
        max-width: 33%; /* Limits how wide an item can get, encouraging wrapping */
      }


      /* Base styles for metric values and subtitles */
      .metric-value {
        font-size: 40px;
        font-weight: bold;
        color: #1e9180;
        margin: 10px 0;
        line-height: 1;
      }

      .metric-subtitle {
        font-size: 14px;
        color: #666;
        margin-top: 8px;
        line-height: 1.4;
        max-width: 90%;
      }

      /* Styles for different data counts (adjust as needed) */
      /* These classes will now primarily affect the font sizes, while flex-wrap handles layout */
      .metric-item-small-data .metric-value {
        font-size: 30px;
      }
      .metric-item-small-data .metric-subtitle {
        font-size: 11px;
      }

      .metric-item-medium-data .metric-value {
        font-size: 24px;
      }
      .metric-item-medium-data .metric-subtitle {
        font-size: 10px;
      }

      .metric-item-large-data .metric-value {
        font-size: 15px;
      }
      .metric-item-large-data .metric-subtitle {
        font-size: 10px;
      }

      .metric-item-very-large-data .metric-value {
        font-size: 10px;
      }
      .metric-item-very-large-data .metric-subtitle {
        font-size: 10px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .chart-box {
          padding: 15px;
          min-height: 120px;
        }

        .metric-title {
          font-size: 16px;
        }

        .metric-value {
          font-size: 32px;
        }

        .metric-subtitle {
          font-size: 12px;
        }

        .metric-item {
          max-width: 100%; /* On small screens, allow items to take full width if needed */
        }
      }
    `,
  ],
})
export class MetricWidgetComponent implements AfterViewInit {
  @Input() widget: any;
  @Input() data: any;

  private chartBoxRef: ElementRef;

  constructor(private el: ElementRef) {
    this.chartBoxRef = el;
  }

  ngAfterViewInit() {
    this.adjustFontSizeBasedOnWidth();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.adjustFontSizeBasedOnWidth();
  }

  adjustFontSizeBasedOnWidth(): void {
    if (this.chartBoxRef && this.chartBoxRef.nativeElement) {
      const chartBoxWidth = this.chartBoxRef.nativeElement.offsetWidth;
      // Note: When items wrap, querying all .metric-value and .metric-subtitle
      // and setting their font size directly might lead to inconsistent results
      // if you also rely on the `getMetricItemClass` for different sizes.
      // Consider if you primarily want width-based scaling for the overall widget
      // or individual item scaling.
      // If you want individual item scaling based on data length, the CSS classes are more robust.

      // Example of width-based adjustment for the *overall* metric content,
      // less for individual metric items when they are wrapping.
      // You might want to adjust the padding or container size here instead
      // of individual font sizes if flex-wrap is handling item layout.
      const metricContents = this.chartBoxRef.nativeElement.querySelectorAll('.metric-content');
      metricContents.forEach((el: HTMLElement) => {
        if (chartBoxWidth < 200) {
          el.style.paddingTop = '10px';
        } else if (chartBoxWidth < 300) {
          el.style.paddingTop = '15px';
        } else {
          el.style.paddingTop = '20px';
        }
      });
    }
  }

  getMetricItemClass(): string {
    if (!this.widget || !this.widget.data) {
      return "";
    }
    const dataLength = this.widget.data.length;
    if (dataLength > 5) {
      return "metric-item-very-large-data";
    } else if (dataLength >= 4) {
      return "metric-item-large-data";
    } else if (dataLength > 2) {
      return "metric-item-medium-data";
    } else if (dataLength > 0) {
      return "metric-item-small-data";
    }
    return "";
  }

  onActionClick(action: string): void {
    console.log("Action clicked:", action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      "paragraph.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/paragraph.png",
      "excel.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/excel.png",
      "audience_4644048.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png",
    };

    return (
      iconMap[iconName] ||
      `https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/${iconName}`
    );
  }
}