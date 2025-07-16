import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MetricWidgetComponent } from "app/modules/dashboard/charts/metric-widget.component";
import { PieChartWidgetComponent } from "app/modules/dashboard/charts/pie-chart-widget.component";
import { BarChartWidgetComponent } from "app/modules/dashboard/charts/bar-chart-widget.component";
import { ColumnChartWidgetComponent } from "app/modules/dashboard/charts/column-chart-widget.component";
import { LineChartWidgetComponent } from "app/modules/dashboard/charts/line-chart-widget.component";
import { SankeyChartWidgetComponent } from "app/modules/dashboard/charts/sankey-chart-widget.component";
import { TextWidgetComponent } from "app/modules/dashboard/charts/text-widget.component";
import { MapWidgetComponent } from "app/modules/dashboard/charts/map-widget.component";
import { WorldMapWidgetComponent } from "../widgets/world-map-widget/world-map-widget.component";
import { PictorialStackedChartWidgetComponent } from "app/modules/dashboard/charts/pictorial-fraction-chart.component";

@Component({
  selector: "app-section",
  standalone: true,
  imports: [
    CommonModule,
    MetricWidgetComponent,
    PieChartWidgetComponent,
    BarChartWidgetComponent,
    ColumnChartWidgetComponent,
    LineChartWidgetComponent,
    SankeyChartWidgetComponent,
    TextWidgetComponent,
    MapWidgetComponent,
    PictorialStackedChartWidgetComponent,
    WorldMapWidgetComponent,
  ],
  template: `
    <div class="section" [style.background-color]="section.background">
      <div class="section-header">
        <h2>{{ section.title }}</h2>
      </div>

      <div
        class="widgets-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 p-6 overflow-y-auto"
      >
        <ng-container *ngFor="let widget of visibleWidgets">
          <!-- Metric Widget -->
          <div
            [class.col-span-1]="widget.columnSize === 1"
            [class.col-span-2]="widget.columnSize === 2"
            [class.col-span-3]="widget.columnSize === 3"
            [class.col-span-4]="widget.columnSize === 4"
            [class.row-span-1]="widget.rowSize === 1"
            [class.row-span-2]="widget.rowSize === 2"
            [class.row-span-3]="widget.rowSize === 3"
            [class.row-span-4]="widget.rowSize === 4"
          >
            <app-metric-widget
              *ngIf="
                widget.chartType === 'CARD' &&
                widget?.name !==
                  'Statut Professionnel : Situation après la certification'
              "
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-metric-widget>

            <div
              *ngIf="
                widget.chartType === 'CARD' &&
                widget?.name ===
                  'Statut Professionnel : Situation après la certification'
              "
              class="grid h-full"
              style="margin-bottom: 20px;"
            >
              <div class="chart-box shadow-[0_2px_8px_rgba(0,0,0,0.1)]" style="position: relative;">
                <div class="button-container">
                  <button class="info-button" title="Information">
                    <img
                      src="https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/paragraph.png "
                      alt="Info"
                    />
                  </button>
                  <button class="info-button primary" title="Export">
                    <img
                      src="https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/excel.png"
                      alt="Download"
                    />
                  </button>
                  <button
                    class="info-button secondary"
                    onclick="toggleAnalysis('chart2-analysis')"
                    title="Scope"
                  >
                    <img
                      src="https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png"
                      alt="Download"
                    />
                  </button>
                </div>
                <h3 class="chart-title">
                  Statut Professionnel : Situation après la certification
                </h3>
                <div class="status-grid-rowed">
                  <div class="status-row" style="color: #00454D">
                    <div class="status-category"></div>
                    <div class="status-value-title"><strong>EE1</strong></div>
                    <div class="status-value-title"><strong>EE2</strong></div>
                    <div class="status-value-title"><strong>EE3</strong></div>
                    <div class="status-value-title"><strong>EE4</strong></div>
                  </div>
                  <div class="status-row">
                    <div class="status-category">A un emploi</div>
                    <div
                      class="status-value"
                      style="background-color: #E6F0F9; border-left: 4px solid #457B9D;"
                    >
                      0%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #E6F0F9; border-left: 4px solid #457B9D;"
                    >
                      75%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #E6F0F9; border-left: 4px solid #457B9D;"
                    >
                      70%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #E6F0F9; border-left: 4px solid #457B9D;"
                    >
                      73%
                    </div>
                  </div>
                  <div class="status-row">
                    <div class="status-category">Recherche</div>
                    <div
                      class="status-value"
                      style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;"
                    >
                      44%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;"
                    >
                      14%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;"
                    >
                      9%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;"
                    >
                      3%
                    </div>
                  </div>
                  <div class="status-row">
                    <div class="status-category">Poursuit des études</div>
                    <div
                      class="status-value"
                      style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;"
                    >
                      56%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;"
                    >
                      3%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;"
                    >
                      4%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;"
                    >
                      3%
                    </div>
                  </div>
                  <div class="status-row">
                    <div class="status-category">Inactif</div>
                    <div
                      class="status-value"
                      style="background-color: #F9E9EC; border-left: 4px solid #A77A82;"
                    >
                      0%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #F9E9EC; border-left: 4px solid #A77A82;"
                    >
                      4%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #F9E9EC; border-left: 4px solid #A77A82;"
                    >
                      2%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #F9E9EC; border-left: 4px solid #A77A82;"
                    >
                      2%
                    </div>
                  </div>
                  <div class="status-row">
                    <div class="status-category">Non répondant</div>
                    <div
                      class="status-value"
                      style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;"
                    >
                      0%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;"
                    >
                      4%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;"
                    >
                      15%
                    </div>
                    <div
                      class="status-value"
                      style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;"
                    >
                      19%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie Chart Widget -->
            <app-pie-chart-widget
              *ngIf="widget.chartType === 'PIE_CHART_BROKEN_DOWN_SLICES'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-pie-chart-widget>

            <!-- Bar Chart Widget -->
            <app-bar-chart-widget
              *ngIf="widget.chartType === 'CLUSTERED_BAR_CHART'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-bar-chart-widget>

            <!-- Column Chart Widget -->
            <app-column-chart-widget
              *ngIf="widget.chartType === 'column'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-column-chart-widget>

            <!-- Line Chart Widget -->
            <app-line-chart-widget
              *ngIf="widget.chartType === 'LINE_CHART_WITH_DATA_LABELS'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-line-chart-widget>

            <!-- Sankey Chart Widget -->
            <app-sankey-chart-widget
              *ngIf="widget.chartType === 'TRACEABLE_SANKEY_DIAGRAM'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-sankey-chart-widget>

            <!-- Text Widget -->
            <app-text-widget
              *ngIf="widget.chartType === 'text'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-text-widget>

            <!-- Map Widget -->
            <app-map-widget
              *ngIf="widget.chartType === 'CLUSTERED_COLUMN_CHART'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-map-widget>

            <app-pictorial-fraction-chart
              *ngIf="widget.chartType === 'PICTORIAL_FRACTION_CHART'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-pictorial-fraction-chart>

            <app-world-map-widget
              *ngIf="widget.chartType === 'DRILL_DOWN_MAP'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-world-map-widget>
          </div>
        </ng-container>
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
        transition: all 0.3s ease;
        min-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .chart-box:hover {
        transform: translateY(-2px);
      }
      .status-grid-rowed {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 20px;
      }

      .status-row {
        display: grid;
        grid-template-columns: 200px repeat(4, 1fr);
        /* 1 for label, 4 for ES values */
        gap: 10px;
        align-items: center;
      }

      .status-category {
        font-weight: bold;
        font-size: 15px;
        color: #15616d;
      }

      .chart-title {
        font-family: "Inter";
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 15px 0 15px 0;
        line-height: 1.3;
      }
      .status-value {
        background-color: #f5f7fa;
        padding: 10px;
        text-align: center;
        border-radius: 8px;
        font-size: 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        font-weight: 500;
      }

      .status-value-title {
        /* background-color: #f5f7fa; */
        padding: 10px;
        text-align: center;
        /* border-radius: 8px; */
        font-size: 14px;
        /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); */
        font-weight: 500;
      }
      .section {
        margin-bottom: 2rem;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .section-header {
        margin-bottom: 1.5rem;
      }

      .section-header h2 {
        margin: 0;
        color: #333;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .widgets-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr); /* Always 4 columns per row */
        gap: 1.5rem;
        align-items: stretch; /* Make all widgets stretch to same height */
      }

      .widget {
      height:100%;
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        width: 100%;
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 350px; /* Ensures equal min height for all widgets */
      }

      .widget:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .widget-small {
        grid-column: span 1;
      }

      .widget-medium {
        grid-column: span 2;
      }

      .widget-large {
        grid-column: span 3;
      }

      @media (max-width: 1024px) {
        .widgets-grid {
          grid-template-columns: 1fr 1fr; /* 2 columns on tablets */
        }
      }
      @media (max-width: 768px) {
        .widgets-grid {
          grid-template-columns: 1fr; /* 1 column on mobile */
        }
        .widget-medium,
        .widget-large {
          grid-column: span 1;
        }
      }
    `,
  ],
})
export class SectionComponent implements OnInit {
  @Input() section!: any;

  visibleWidgets: any[] = [];

  ngOnInit(): void {
    this.updateVisibleWidgets();
  }

  ngOnChanges(): void {
    this.updateVisibleWidgets();
  }

  private updateVisibleWidgets(): void {
    if (this.section && this.section.widgetIds?.length) {
      this.visibleWidgets = this.section.widgetIds
        .filter((widget: any) => widget.visible)
        .sort((a: any, b: any) => {
          // Sort by widget order if available, otherwise by title
          const aOrder = parseInt(a.id) || 0;
          const bOrder = parseInt(b.id) || 0;
          return aOrder - bOrder;
        });
    }
  }
}
