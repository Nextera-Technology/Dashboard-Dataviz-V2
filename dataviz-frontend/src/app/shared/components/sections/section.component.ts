import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MetricWidgetComponent } from "app/modules/dashboard/charts/metric-widget.component";
import { PieChartWidgetComponent } from "app/modules/dashboard/charts/pie-chart-widget.component";
import { BarChartWidgetComponent } from "app/modules/dashboard/charts/bar-chart-widget.component";
import { ColumnChartWidgetComponent } from "app/modules/dashboard/charts/column-chart-widget.component";
import { LineChartWidgetComponent } from "app/modules/dashboard/charts/line-chart-widget.component";
import { SankeyChartWidgetComponent } from "app/modules/dashboard/charts/sankey-chart-widget.component";
import { TextWidgetComponent } from "app/modules/dashboard/charts/text-widget.component";
import { WorldMapWidgetComponent } from "../widgets/world-map-widget/world-map-widget.component";
import { PictorialStackedChartWidgetComponent } from "app/modules/dashboard/charts/pictorial-fraction-chart.component";
import { BreakDownChartWidgetComponent } from "app/modules/dashboard/charts/breakdown-chart-widget.component";
import { YesNoGaugeWidgetComponent } from "../widgets/yes-no-gauge-widget/yes-no-gauge-widget.component";
import { SortedBarChartWidgetComponent } from "../widgets/sorted-bar-chart-widget/sorted-bar-chart-widget.component";

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
    PictorialStackedChartWidgetComponent,
    WorldMapWidgetComponent,
    BreakDownChartWidgetComponent,
    YesNoGaugeWidgetComponent,
    SortedBarChartWidgetComponent
  ],
  template: `
    <div class="section" [style.background-color]="section.background">
      <div class="section-header">
        <h2>{{ section.title }}</h2>
      </div>

      <div
        class="widgets-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 auto-rows-[250px] gap-6 p-6 overflow-y-auto"
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
                widget.chartType === 'CARD' && !(widget?.widgetType === 'STATUS_BY_WAVE'  || widget?.widgetSubType === 'STATUS_WAVE_BREAKDOWN')
              "
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-metric-widget>

            <app-breakdown-chart-widget
              *ngIf="
                widget.chartType === 'CARD' && (widget?.widgetType === 'STATUS_BY_WAVE'  || widget?.widgetSubType === 'STATUS_WAVE_BREAKDOWN')
              "
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-breakdown-chart-widget>

            <!-- <div
              *ngIf="
                widget.chartType === 'CARD' &&
                widget?.widgetType ===
                  'STATUS_BY_WAVE' &&
                widget?.widgetSubType === 'STATUS_WAVE_BREAKDOWN'
              "
              class="grid h-full"
              style="margin-bottom: 20px;"
            >
              <div class="chart-box shadow-[0_2px_8px_rgba(0,0,0,0.1)]" style="position: relative; padding: 20px; background-color: #fff;">
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

                 <h3>{{widget?.name}}</h3>
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
                      <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave("En activité professionnelle", 1)}}</div>
                      <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave("En activité professionnelle", 2)}}</div>
                      <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave("En activité professionnelle", 3)}}</div>
                      <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave("En activité professionnelle", 4)}}</div>
                    </div>
                    <div class="status-row">
                      <div class="status-category">Recherche</div>
                      <div class="status-value" style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;">{{getDataForWave("En recherche d'emploi", 1)}}</div>
                      <div class="status-value" style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;">{{getDataForWave("En recherche d'emploi", 2)}}</div>
                      <div class="status-value" style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;">{{getDataForWave("En recherche d'emploi", 3)}}</div>
                      <div class="status-value" style="background-color: #FAF2E6; border-left: 4px solid #D69B5A;">{{getDataForWave("En recherche d'emploi", 4)}}</div>
                    </div>
                    <div class="status-row">
                      <div class="status-category">Poursuit des études</div>
                      <div class="status-value" style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;">{{getDataForWave("En poursuite d'études (formation initiale ou alternance)", 1)}}</div>
                      <div class="status-value" style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;">{{getDataForWave("En poursuite d'études (formation initiale ou alternance)", 2)}}</div>
                      <div class="status-value" style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;">{{getDataForWave("En poursuite d'études (formation initiale ou alternance)", 3)}}</div>
                      <div class="status-value" style="background-color: #E6F7F4; border-left: 4px solid #2A9D8F;">{{getDataForWave("En poursuite d'études (formation initiale ou alternance)", 4)}}</div>
                    </div>
                    <div class="status-row">
                      <div class="status-category">Inactif</div>
                      <div class="status-value" style="background-color: #F9E9EC; border-left: 4px solid #A77A82;">{{getDataForWave("Inactif (ex : congés maternité, maladie longue, sabbatique, césure...)", 1)}}</div>
                      <div class="status-value" style="background-color: #F9E9EC; border-left: 4px solid #A77A82;">{{getDataForWave("Inactif (ex : congés maternité, maladie longue, sabbatique, césure...)", 2)}}</div>
                      <div class="status-value" style="background-color: #F9E9EC; border-left: 4px solid #A77A82;">{{getDataForWave("Inactif (ex : congés maternité, maladie longue, sabbatique, césure...)", 3)}}</div>
                      <div class="status-value" style="background-color: #F9E9EC; border-left: 4px solid #A77A82;">{{getDataForWave("Inactif (ex : congés maternité, maladie longue, sabbatique, césure...)", 4)}}</div>
                    </div>
                    <div class="status-row">
                      <div class="status-category">Non répondant</div>
                      <div class="status-value" style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;">{{getDataForWave("Non répondant", 1)}}</div>
                      <div class="status-value" style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;">{{getDataForWave("Non répondant", 2)}}</div>
                      <div class="status-value" style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;">{{getDataForWave("Non répondant", 3)}}</div>
                      <div class="status-value" style="background-color: #e9e9f9; border-left: 4px solid #7d7aa7;">{{getDataForWave("Non répondant", 4)}}</div>
                    </div>
                  </div>
              </div>
            </div> -->

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

            <!-- <app-bar-chart-widget-ouvert
              *ngIf="widget.chartType === 'CLUSTERED_BAR_CHART' && widget?.name === 'Ouvert – Commencé – Enquête complétée (EE1–EE4)'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-bar-chart-widget-ouvert> -->

             <!-- <app-bar-chart-widget-contrat
              *ngIf="widget.chartType === 'CLUSTERED_BAR_CHART' && widget?.name === 'Type de contrat'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-bar-chart-widget-contrat>

            <app-bar-chart-widget-top
              *ngIf="widget.chartType === 'CLUSTERED_BAR_CHART' && widget.name === 'Top 8 fonctions'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-bar-chart-widget-top> -->

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
            <app-column-chart-widget
              *ngIf="widget.chartType === 'CLUSTERED_COLUMN_CHART'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-column-chart-widget>

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

            <!-- Yes/No Gauge Widget -->
            <app-yes-no-gauge-widget
              *ngIf="widget.chartType === 'YES_NO_GAUGE'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-yes-no-gauge-widget>

            <!-- Sorted Bar Chart Widget for COMPETENCY_AUTONOMY -->
            <app-sorted-bar-chart-widget
              *ngIf="(['JOBDESC_COMPETENCY_AUTONOMY', 'JOBDESC_COMPETENCY_COVERAGE', 'JOBDESC_COMPETENCY_SCORE_DISTRIBUTION'].includes(widget.widgetType)) && widget.chartType === 'SORTED_BAR_CHART'"
              [widget]="widget"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-sorted-bar-chart-widget>

            <!-- Other Sorted Bar Chart Widget -->
            <app-bar-chart-widget
              *ngIf="(widget.chartType === 'SORTED_BAR_CHART' && !['JOBDESC_COMPETENCY_AUTONOMY', 'JOBDESC_COMPETENCY_COVERAGE', 'JOBDESC_COMPETENCY_SCORE_DISTRIBUTION'].includes(widget.widgetType)) || widget.chartType === 'SortedBarChart' || widget.chartType === 'sorted_bar_chart'"
              [widget]="widget"
              [data]="widget?.data"
              class="widget"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-medium]="widget.size === 'medium'"
              [class.widget-large]="widget.size === 'large'"
            >
            </app-bar-chart-widget>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ["./section.component.scss"],
})
export class SectionComponent implements OnInit {
  @Input() section!: any;

  visibleWidgets: any[] = [];

  cardData: any[] = [];
  situationData = [];
  ngOnInit(): void {
    this.updateVisibleWidgets();
  }

  ngOnChanges(): void {
    this.updateVisibleWidgets();
  }

  private updateVisibleWidgets(): void {
    if (this.section && Array.isArray(this.section.widgetIds) && this.section.widgetIds.length) {
      this.visibleWidgets = this.section.widgetIds
        .filter((widget: any) => widget && widget.visible)
        // Ensure consistent ordering (by id if numeric or fallback to title)
        .map((widget: any) => ({
          ...widget,
          columnSize: typeof widget.columnSize === 'string' ? parseInt(widget.columnSize, 10) : widget.columnSize,
          rowSize: typeof widget.rowSize === 'string' ? parseInt(widget.rowSize, 10) : widget.rowSize,
        }))
        .sort((a: any, b: any) => {
          // Sort by widget order if available, otherwise by title
          const aOrder = Number(a.id) || 0;
          const bOrder = Number(b.id) || 0;
          return aOrder - bOrder;
        });
    }
    this.prepareDataForSituationChart();
  }

  prepareDataForSituationChart() {
    this.visibleWidgets.forEach(widget => {
      if (widget.chartType === 'CARD') {
        this.cardData = widget.data || [];
        this.situationData = this.transformDataWithPercentage(this.cardData);
        // console.log(this.situationData);
      }
    });
  }

  transformDataWithPercentage(dataArray) {
    const result = {};
    const allWaves = [1, 2, 3, 4];

    dataArray.forEach(item => {
      const { name, wave, percentage } = item;
      const waveKey = `EE${wave}`;

      if (!result[name]) {
        result[name] = {};
        // Initialize all waves with 0
        allWaves.forEach(w => {
          result[name][`EE${w}`] = 0;
        });
      }

      result[name][waveKey] = percentage;
    });

    // Convert result object to array of objects
    return result ? Object.keys(result).map(key => ({
      name: key,
      ...result[key]
    })) : [];
  }

  getDataForWave(service: string, wave: number): string {
    const waveKey = `EE${wave}`;
    const dataItem = this.situationData.find(item => item.name === service);
    return dataItem ? dataItem[waveKey] + '%' : '0%';
  }


}
