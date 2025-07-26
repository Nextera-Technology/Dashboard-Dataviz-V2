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
    >
                <app-actions-buttons [widget]="widget"></app-actions-buttons>

                <div class="widget-content center-content h-full">
                 <h3 class="mt-3">{{widget?.name}}</h3>
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
      min-height: 300px;
      display: flex;
      flex-direction: column;
    }

    .chart-box:hover {
      transform: translateY(-2px);
    }



    /* Chart Content */
    .chart-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chart-title {
      font-family: 'Inter';
      font-size: 18px;
      font-weight: 600;
      color: #00454D;
      margin: 0 0 15px 0;
      line-height: 1.3;
    }

    .chart-container {
      height: 300px;
      width: 100%;
      margin-bottom: 15px;
    }

    /* Manual Legend */
    .manual-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 10px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      text-align: left;
      color: #333;
    }

    .chart-legend {
      position: absolute;
      top: 10px;
      left: 14px;
      z-index: 2;
      background: rgba(255, 255, 255, 0.85);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #15616d;
      pointer-events: none;
      text-align: left;
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
      color: #15616D;
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


    /* Responsive */
    @media (max-width: 768px) {
      .chart-box {
        padding: 15px;
        min-height: 250px;
      }

      .chart-title {
        font-size: 16px;
      }

      .chart-container {
        height: 250px;
      }

      .legend-item {
        font-size: 12px;
      }
    }
  `]
})
export class BreakDownChartWidgetComponent implements OnInit, OnDestroy {

  @Input() widget: any;
  @Input() data: any;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  totalData: number = 0;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any[] = [];
  cardData: any[] = [];
  situationData = [];

  ngOnInit(): void {
    // this.calculateTotalData();
    if (this.widget.data) {
      this.prepareDataForSituationChart();
    }

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