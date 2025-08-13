import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActionsButtonsComponent } from 'app/shared/components/actions-buttons/actions-buttons.component';

declare var am5: any;
declare var am5xy: any;

@Component({
  selector: 'app-breakdown-chart-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule,ActionsButtonsComponent],
  template: `
     <div
      class="chart-box relative"
      [style.background-color]="widget.data?.background || '#ffffff'"
      [class.small-widget]="isSmall"
      [class.tiny-widget]="isTiny"
      [class.two-by-one]="isTwoByOne"
    >
      <app-actions-buttons [widget]="widget"></app-actions-buttons>
      <div class="chart-content">
        <h3 class="chart-title">{{widget?.name}}</h3>
        <div class="status-grid-container">
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
              <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave('En activité professionnelle', 1)}}</div>
              <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave('En activité professionnelle', 2)}}</div>
              <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave('En activité professionnelle', 3)}}</div>
              <div class="status-value" style="background-color: #E6F0F9; border-left: 4px solid #457B9D;">{{getDataForWave('En activité professionnelle', 4)}}</div>
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
      </div>
    </div>
  `,
  styles: [`
    .chart-box {
      height:100%;
      position: relative;
      text-align: center;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      overflow: hidden; /* prevent bleed in tight tiles */
    }
    .chart-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .chart-title {
      font-family: 'Inter';
      font-size: 18px;
      font-weight: 600;
      color: #00454D;
      margin: 0 0 15px 0;
      line-height: 1.3;
      flex-shrink: 0;
    }
    .status-grid-container {
      flex-grow: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden; /* keep within tile */
    }

    /* 2x1 tiles: allow internal scrolling to avoid bottom clipping */
    .two-by-one .status-grid-container {
      overflow-y: auto;
      max-height: 200px; /* fit within ~1-row tile height in main grid */
      overscroll-behavior: contain;
      scrollbar-width: thin;
    }
    .two-by-one .status-grid-container::-webkit-scrollbar { height: 6px; width: 6px; }
    .two-by-one .status-grid-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25); border-radius: 6px; }
    .two-by-one .status-grid-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }

    /* Slightly compact layout for 2x1 */
    .two-by-one .status-grid-rowed { gap: 8px; margin-top: 6px; }
    .two-by-one .status-row { grid-template-columns: 100px repeat(4, 1fr); gap: 6px; }
    .two-by-one .chart-title { margin-bottom: 8px; font-size: 16px; }
    .two-by-one .status-category { font-size: 13px; }
    .two-by-one .status-value, .two-by-one .status-value-title { font-size: 14px; padding: 6px; }
    .status-grid-rowed {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 10px;
      flex-grow: 1;
    }
    .status-row {
      display: grid;
      grid-template-columns: 120px repeat(4, 1fr);
      gap: 8px;
      align-items: stretch;
      flex-grow: 1;
    }
    .status-value,
    .status-value-title {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .status-category {
      font-weight: bold;
      font-size: 15px;
      color: #15616D;
      text-align: left;
    }
    .status-value {
      background-color: #f5f7fa;
      padding: 8px;
      text-align: center;
      border-radius: 8px;
      font-size: 18px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      font-weight: 500;
    }
    .status-value-title {
      padding: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }

    /* Color header wave labels (EE1–EE4) to match wave palette */
    .status-grid-rowed > .status-row:first-child .status-value-title:nth-child(2) { color: #BCDCDC; }
    .status-grid-rowed > .status-row:first-child .status-value-title:nth-child(3) { color: #68B3B3; }
    .status-grid-rowed > .status-row:first-child .status-value-title:nth-child(4) { color: #2A8A8A; }
    .status-grid-rowed > .status-row:first-child .status-value-title:nth-child(5) { color: #0E4B4B; }

    /* Color row category labels to match row colors */
    .status-grid-rowed .status-row:nth-of-type(2) .status-category { color: #457B9D; }
    .status-grid-rowed .status-row:nth-of-type(3) .status-category { color: #D69B5A; }
    .status-grid-rowed .status-row:nth-of-type(4) .status-category { color: #2A9D8F; }
    .status-grid-rowed .status-row:nth-of-type(5) .status-category { color: #A77A82; }
    .status-grid-rowed .status-row:nth-of-type(6) .status-category { color: #7d7aa7; }
    /* Small Widget Adjustments */
    .small-widget.chart-box {
        padding: 10px;
    }
    .small-widget .status-grid-rowed {
      gap: 4px;
      margin-top: 5px;
    }
    .small-widget .status-row {
       grid-template-columns: 80px repeat(4, 1fr);
       gap: 4px;
    }
    .small-widget .chart-title {
        font-size: 14px;
        margin-bottom: 8px;
    }
    .small-widget .status-category {
      font-size: 11px;
    }
    .small-widget .status-value, .small-widget .status-value-title {
      font-size: 10px;
      padding: 4px;
      font-weight: normal;
    }
     .small-widget .status-value-title strong {
        font-weight: 500;
     }
     .small-widget .status-value { font-size: 16px; }
    .small-widget .status-value-title { font-size: 11px; }

      /* Tiny Widget Adjustments (1x1) - Further Reduced */
      .tiny-widget.chart-box {
          padding: 4px;
      }
      .tiny-widget .status-grid-rowed {
        gap: 1px;
        margin-top: 2px;
      }
      .tiny-widget .status-row {
         grid-template-columns: 60px repeat(4, 1fr);
         gap: 2px;
      }
      .tiny-widget .chart-title {
          font-size: 11px;
          margin-bottom: 4px;
      }
      .tiny-widget .status-category {
        font-size: 9px;
        font-weight: normal;
        word-break: break-word;
      }
      .tiny-widget .status-value, .tiny-widget .status-value-title {
        font-size: 8px;
        padding: 1px;
      }
      .tiny-widget .status-value { font-size: 12px; }
      .tiny-widget .status-value-title { font-size: 9px; }
  `]
})
export class BreakDownChartWidgetComponent implements OnInit, OnDestroy {

  @Input() widget: any;
  @Input() data: any;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  totalData: number = 0;
  isSmall: boolean = false;
  isTiny: boolean = false;
  isTwoByOne: boolean = false;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any[] = [];
  cardData: any[] = [];
  situationData = [];

  ngOnInit(): void {
    if (this.widget.data) {
      this.prepareDataForSituationChart();
    }
    const rowSize = this.widget?.rowSize || 1;
    const colSize = this.widget?.columnSize || 1;
    this.isTiny = rowSize === 1 && colSize === 1;
    this.isSmall = rowSize <= 2 && !this.isTiny;
    this.isTwoByOne = rowSize === 1 && colSize === 2;
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  prepareDataForSituationChart() {
      this.situationData = this.transformDataWithPercentage(this.data);
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


  private calculateTotalData(): void {
    if (!this.widget?.data) {
      this.totalData = 0;
      return;
    }

    const dataObj = this.widget.data;

    // Case 1: If data is array
    if (Array.isArray(dataObj) && dataObj.length) {
      this.totalData = dataObj[0]?.totalData ?? dataObj.length;
      return;
    }

    // Case 2: If data contains series array
    if (Array.isArray(dataObj.series) && dataObj.series.length) {
      // Try to use totalData from first series item
      if (dataObj.series[0]?.totalData !== undefined) {
        this.totalData = dataObj.series[0].totalData;
      } else {
        // Fallback: sum available count/value fields
        this.totalData = dataObj.series.reduce((sum: number, item: any) => {
          const v = item.count ?? item.value ?? 0;
          return sum + v;
        }, 0);
      }
      return;
    }

    // Case 3: If totalData field exists directly
    this.totalData = dataObj.totalData ?? 0;
  }
} 