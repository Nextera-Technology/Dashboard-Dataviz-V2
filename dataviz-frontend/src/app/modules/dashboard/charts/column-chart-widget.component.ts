import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardWidget, WidgetAction } from 'app/shared/services/dashboard.service';
import { ActionsButtonsComponent } from 'app/shared/components/actions-buttons/actions-buttons.component';

declare var am5: any;
declare var am5xy: any;

@Component({
  selector: 'app-column-chart-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent, TranslatePipe],
  template: `
    <div class="chart-box" [ngClass]="{'one-by-one': isOneByOne()}" [style.background-color]="widget?.background || '#ffffff'">
      <!-- Total Data label -->
      <div class="chart-legend">{{ 'shared.worldMapWidget.students_total_label' | translate }} {{ totalData }}</div>

      <app-actions-buttons [widget]="widget"></app-actions-buttons>

      <!-- Widget Content -->
      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>
        
        <!-- Chart Container -->
        <div #chartContainer class="chart-container"></div>
        
        <!-- Manual Legend (if needed) -->
        <div class="manual-legend" *ngIf="widget.data?.series">
          <div 
            *ngFor="let series of widget.data.series" 
            class="legend-item">
            <span class="legend-color" [style.background-color]="series.color"></span>
            <span class="legend-label">
              {{ series.name }}
            </span>
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
      min-height: 200px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
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
      margin: 30px 0 15px 0; /* Added top margin for spacing */
      line-height: 1.3;
    }

    .chart-container {
      flex: 1; /* Use flex to fill available space */
      width: 100%;
      margin-bottom: 15px;
      min-height: 150px; /* Prevent collapsing on small data */
    }

    /* Tuning for compact 1x1 tiles */
    .chart-box.one-by-one {
      padding: 12px;
    }
    .chart-box.one-by-one .chart-title {
      margin: 10px 0 8px 0;
      font-size: 16px;
    }
    .chart-box.one-by-one .chart-container {
      min-height: 0;
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

    /* Responsive */
    @media (max-width: 768px) {
      .chart-box {
        padding: 15px;
        min-height: 200px;
      }

      .chart-title {
        font-size: 16px;
      }

      .chart-container {
        /* Removed fixed height to allow flexibility */
      }

      .legend-item {
        font-size: 12px;
      }
    }
  `]
})
export class ColumnChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget: any;
  @Input() data: any;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  totalData: number = 0;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any[] = [];

  isOneByOne(): boolean {
    const col = Number(this.widget?.columnSize);
    const row = Number(this.widget?.rowSize);
    return col === 1 && row === 1;
  }

  ngOnInit(): void {
    this.calculateTotalData();
    if (this.widget.widgetType === 'SURVEY_COMPLETION' || this.widget.widget === 'SURVEY_COMPLETION') {
      this.createSurveyChart();
    } else if (this.widget.data?.series) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }


  JobBaseMap = {
    "SENT": "Envoyées",
    "OPENED": "Ouvertes",
    "COMPLETED": "Complétées"
  }

  jobBaseColors = {
    "représentant commercial": "#1D3557",
    "chargé(e) de communication": "#457B9D",
    "chargé(e) d'études marketing": "#A8DADC",
    "responsable de marché": "#F4A261",
    "responsable marketing": "#E76F51",
    "responsable de marque": "#2A9D8F",
    "chef de produit": "#264653",
    "chef de projet marketing": "#6D597A",
    "responsable de secteur": "#B5838D",
    "commercial": "#8ECAE6",
    "conseiller commercial": "#219EBC",
    "responsable des ventes": "#023047",
    "directeur commercial": "#FFB703",
    "responsable performance marketing et ventes": "#FB8500",
    "responsable de rayon/ d’univers": "#9B5DE5",
    "responsable des études marketing": "#F15BB5",
    "autre": "#ADB5BD",
    "CDI": "#1D3557",
    "CDD": "#457B9D",
    "Intérim": "#A8DADC",
    "Fonctionnaire": "#F4A261",
    "Contractuel": "#E76F51",
    "Auto-Entrepreneur": "#2A9D8F",
    "Gérant": "#264653",
    "Indépendant": "#6D597A",
    "Mandataire Social": "#B5838D",
    "Autre": "#ADB5BD",
    "SENT": "#8FD2D2",
    "OPENED": "#4A90E2",
    "COMPLETED": "#0E3F2D",
  };

  createSurveyChart(): void {
    const originalData = [...this.data];
    const waveLabelMap = {
      1: 'EE1',
      2: 'EE2',
      3: 'EE3',
      4: 'EE4'
    };

    const waves = Object.keys(waveLabelMap).map(Number);

    // Get unique job names
    const jobTitles = Array.from(new Set(originalData.map(d => d.name)));

    // 1. Prepare wave labels
    const waveLabels = waves.map(w => waveLabelMap[w]);

    // 2. Get job types (Sent, Opened, Completed)
    const jobNames = Array.from(new Set(originalData.map(d => d.name)));

    // 3. Group data for vertical bar chart
    const groupedData = waves.map(waveNum => {
      const waveLabel = waveLabelMap[waveNum];
      const entry: any = { wave: waveLabel };

      jobNames.forEach(name => {
        const item = originalData.find(d => d.wave === waveNum && d.name === name);
        entry[name] = item ? item.count : 0;
        // Add percentage for label
        entry[`${name}_percentage`] = item ? item.percentage : null;
      });

      return entry;
    });

    // 4. Create chart
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root.setThemes([am5.Theme.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: this.root.verticalLayout
      })
    );

    // 5. Create X axis (category - wave)
    this.xAxis = this.chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: "wave",
        renderer: am5xy.AxisRendererX.new(this.root, { minGridDistance: 30 })
      })
    );
    this.xAxis.data.setAll(groupedData);

    // 6. Create Y axis (value)
    this.yAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        min: 0,  // Set minimum value to 0
        renderer: am5xy.AxisRendererY.new(this.root, {})
      })
    );

    // 7. Create one series per job (Sent, Opened, Completed)
    jobNames.forEach(jobName => {
      const series = this.chart.series.push(
        am5xy.ColumnSeries.new(this.root, {
          name: this.JobBaseMap[jobName],
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          valueYField: jobName,
          categoryXField: "wave",
          clustered: true,
          tooltip: am5.Tooltip.new(this.root, {
            labelText: `{name} - {categoryX}: {valueY} ({${jobName}_percentage}%)`
          })
        })
      );

      series.columns.template.setAll({
        tooltipText: `{name} - {categoryX}: {valueY} ({${jobName}_percentage}%)`,
        strokeWidth: 1,
        cornerRadiusTL: 4,
        cornerRadiusTR: 4
      });

      // Optional: Use jobBaseColors
      series.columns.template.adapters.add("fill", (fill, target) => {
        return am5.color(this.jobBaseColors[jobName] || "#000");
      });
      series.columns.template.adapters.add("stroke", (stroke, target) => {
        return am5.color(this.jobBaseColors[jobName] || "#000");
      });

      series.data.setAll(groupedData);
      series.appear(1000);

      series.bullets.push(() => {
        const label = am5.Label.new(this.root, {
          text: `{${jobName}_percentage}%`,
          populateText: true,
          centerX: am5.percent(50),
          centerY: am5.percent(100),
          dy: -5,
          fontSize: 10
        });

        // Apply same color as bar
        label.adapters.add("fill", () => {
          return am5.color(this.jobBaseColors[jobName] || "#000");
        });

        return am5.Bullet.new(this.root, {
          locationY: 1,
          sprite: label
        });
      });
    });

    // 8. Add legend (skip for very small 1x1 tiles to avoid overflow)
    if (!this.isOneByOne()) {
      this.chart.set("legend", am5.Legend.new(this.root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        centerY: am5.percent(100),
        y: am5.percent(100),
        layout: this.root.horizontalLayout
      }));
    }

    // 9. Animate chart
    this.chart.appear(1000, 100);
  }

  private createChart(): void {
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root.setThemes([am5.Theme.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        layout: this.root.verticalLayout,
        maskBullets: false
      })
    );

    // X Axis (categories)
    this.xAxis = this.chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(this.root, { minGridDistance: 30 })
      })
    );

    // Y Axis (values)
    this.yAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {})
      })
    );

    // Set categories
    const categories = this.widget.data.categories || [];
    this.xAxis.data.setAll(categories.map((cat: string, index: number) => ({ category: cat })));

    // Create series for each data series
    this.widget.data.series.forEach((seriesData: any, index: number) => {
      const series = this.chart.series.push(
        am5xy.ColumnSeries.new(this.root, {
          name: seriesData.name,
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          valueYField: 'value',
          categoryXField: 'category',
          fill: am5.color(seriesData.color || '#67b7dc'),
          stroke: am5.color(seriesData.color || '#67b7dc')
        })
      );

      // Set data for this series
      const data = categories.map((cat: string, catIndex: number) => ({
        category: cat,
        value: seriesData.data[catIndex] || 0,
        percentage: seriesData.percentages ? seriesData.percentages[catIndex] : null
      }));
      series.data.setAll(data);

      // Configure appearance
      series.columns.template.setAll({
        cornerRadiusTL: 6,
        cornerRadiusTR: 6,
        strokeWidth: 2,
        tooltipText: '{name}: {valueY} ({percentage}%)'
      });
      this.series.push(series);
    });

    // Add legend (skip for very small 1x1 tiles to avoid overflow)
    if (!this.isOneByOne()) {
      const legend = this.chart.children.push(
        am5.Legend.new(this.root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          centerY: am5.percent(100),
          y: am5.percent(100),
          layout: this.root.horizontalLayout
        })
      );
      legend.data.setAll(this.series);
    }

    // Animate
    this.series.forEach(series => {
      series.appear(1000, 100 * this.series.indexOf(series));
    });
    this.chart.appear(1000, 100);
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