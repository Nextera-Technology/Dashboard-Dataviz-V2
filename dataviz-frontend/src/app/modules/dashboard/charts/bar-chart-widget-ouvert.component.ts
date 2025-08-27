import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

declare var am5: any;
declare var am5xy: any;

@Component({
  selector: "app-bar-chart-widget-ouvert",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="chart-box relative"
      [style.background-color]="widget?.background || '#ffffff'"
    >
      <div class="chart-legend">{{ 'shared.worldMapWidget.students_total_label' | translate }} {{ totalData }}</div>
      <!-- Action Buttons -->
      <div class="button-container">
        <button class="info-button primary" (click)="onActionClick('info')" title="Information">
          <img [src]="getActionIcon('paragraph.png')" alt="Info" />
        </button>
        <button class="info-button secondary" (click)="onActionClick('export')" title="Export">
          <img [src]="getActionIcon('excel.png')" alt="Export" />
        </button>
        <button
          class="info-button secondary"
          (click)="onActionClick('analysis')"
          title="Analysis"
        >
          <img [src]="getActionIcon('audience_4644048.png')" alt="Analysis" />
        </button>
      </div>

      <!-- JobBaseMap Horizontal Listing -->
    

      <!-- Widget Content -->
      <div class="chart-content mt-6">
        <h3 class="chart-title" style="margin-top: 16px;">{{ widget.title }}</h3>
         <div class="job-base-map-list">
        <span *ngFor="let key of jobBaseMapKeys; let last = last">
          <span 
                        class="font-medium inline-block align-middle mr-2" 
                        [ngStyle]="{
                            'background-color': jobBaseColors[key]?.toCSSString ? jobBaseColors[key].toCSSString() : jobBaseColors[key],
                            'width': '20px',
                            'height': '20px',
                            'display': 'inline-block',
                            'border-radius': '4px'
                        }">
                    </span>
          {{ JobBaseMap[key] }}<span *ngIf="!last"> | </span>
        </span>
      </div>
        <!-- Chart Container -->
        <div #chartContainer class="chart-container"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .chart-box {
        height: 100%;
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

      .chart-title {
        font-family: "Inter";
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 0 0 15px 0;
        line-height: 1.3;
      }

      .chart-container {
        height: 100%;
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

      .legend-value {
        font-weight: 600;
      }

      /* JobBaseMap Horizontal Listing */
      .job-base-map-list {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin: 10px 0 0 0;
        font-size: 15px;
        font-weight: 500;
        color: #15616d;
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
        .job-base-map-list {
          font-size: 13px;
        }
      }
    `,
  ],
})
export class BarChartWidgetOuvertComponent implements OnInit, OnDestroy {
  @Input() widget: any;
  @Input() data: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  totalData: number = 0;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any;
  jobTitles: string[] = [];
  waveLabelMap = {
    1: 'EE1',
    2: 'EE2',
    3: 'EE3',
    4: 'EE4'
  };
  waves: number[] = [];

  jobBaseColors = {
    "SENT": "#8FD2D2",
    "OPENED": "#4A90E2",
    "COMPLETED": "#0E3F2D",
  };

  JobBaseMap={
    "SENT": "Envoyées",
    "OPENED": "Ouvertes",
    "COMPLETED": "Complétées"
  }

  get jobBaseMapKeys(): string[] {
    return Object.keys(this.JobBaseMap);
  }

    // createSeries("Envoyées", "Sent", "#8FD2D2");
    //   createSeries("Ouvertes", "Opened", "#4A90E2");
    //   // createSeries("Ouverture de l'enquête", "Started", "#4A90E2");
    //   createSeries("Complétées", "Completed", "#0E3F2D");


  ngOnInit(): void {
    this.calculateTotalData();
    if (this.widget.data) {
      this.waveLabelMap = {
        1: 'EE1',
        2: 'EE2',
        3: 'EE3',
        4: 'EE4',
      };

      this.waves = Object.keys(this.waveLabelMap).map(Number);

      // Get unique job names
      this.jobTitles = Array.from(new Set(this.data.map(d => d.name)));

      // For each wave, build a series (bar values are per job name)
      this.series = this.waves.map(waveNum => ({
        name: this.waveLabelMap[waveNum],
        data: this.jobTitles.map(name => {
          const match = this.data.find(
            d => d.name === name && d.wave === waveNum
          );
          return match ? match.count : 0;
        })
      }));
      this.createChart1();
    }
  }

  createChart1(): void {
  const originalData = [...this.data];

  // 1. Prepare wave labels
  const waveLabels = this.waves.map(w => this.waveLabelMap[w]);

  // 2. Get job types (Sent, Opened, Completed)
  const jobNames = Array.from(new Set(originalData.map(d => d.name)));

  // 3. Group data for vertical bar chart
  const groupedData = this.waves.map(waveNum => {
    const waveLabel = this.waveLabelMap[waveNum];
    const entry: any = { wave: waveLabel };

    jobNames.forEach(name => {
      const item = originalData.find(d => d.wave === waveNum && d.name === name);
      entry[name] = item ? item.count : 0;
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
          labelText: `{name} - {categoryX}: {valueY}`
        })
      })
    );

    series.columns.template.setAll({
      tooltipText: `{name} - {categoryX}: {valueY}`,
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
  });

  // 8. Add legend
  this.chart.set("legend", am5.Legend.new(this.root, {}));

  // 9. Animate chart
  this.chart.appear(1000, 100);
}


  createChart(): void {
    const originalData = [...this.data];

    // Step 1: Extract all unique job titles
    const jobTitles = Array.from(new Set(originalData.map(d => d.name)));

    // Step 2: Group data into new format
    const groupedData = jobTitles.map(title => {
      const entry = { name: title, EE1: 0, EE2: 0, EE3: 0, EE4: 0 };
      originalData.forEach(item => {
        if (item.name === title) {
          const waveKey = `EE${item.wave}`;
          entry[waveKey] = item.count;
        }
      });
      return entry;
    });
   
    

    // Step 3: Create root and chart
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root.setThemes([am5.Theme.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        layout: this.root.verticalLayout,
      })
    );

    // Step 4: Y Axis (Job Titles)
    const yAxis = this.chart.yAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: "name",
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );
    yAxis.data.setAll(groupedData);

    // Step 5: X Axis (Count)
    const xAxis = this.chart.xAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererX.new(this.root, {}),
      })
    );

    // Step 6: Create series for each wave (EE1, EE2, ...)
    ["EE1", "EE2", "EE3", "EE4"].forEach((wave, index) => {
        const esShade = { EE1: 50, EE2: 20, EE3: -20, EE4: -50 }[wave];
      const series = this.chart.series.push(
        am5xy.ColumnSeries.new(this.root, {
          name: wave,
          xAxis: xAxis,
          yAxis: yAxis,
          valueXField: wave,
          categoryYField: "name",
          clustered: true,
          tooltip: am5.Tooltip.new(this.root, {
            labelText: `{name} - ${wave}: {${wave}}`
          }),
        })
      );

      // Optional colors
      series.columns.template.setAll({
        tooltipText: `{name} - ${wave}: {${wave}}`,
        cornerRadiusTL: 4,
        cornerRadiusBL: 4,
        strokeWidth: 1
      });


      // Apply different colors per job title
      series.columns.template.adapters.add("fill", (fill, target) => {
        const dataItem = target.dataItem;
        const jobTitle = dataItem?.dataContext?.name;
        if (jobTitle && this.jobBaseColors[jobTitle]) {
          return am5.color(this.shadeColor(this.jobBaseColors[jobTitle], esShade));
        }
        return fill;
      });

      series.columns.template.adapters.add("stroke", (stroke, target) => {
        const dataItem = target.dataItem;
        const jobTitle = dataItem?.dataContext?.name;
        if (jobTitle && this.jobBaseColors[jobTitle]) {
         return am5.color(this.shadeColor(this.jobBaseColors[jobTitle], esShade));
        }
        return stroke;
      });

      series.data.setAll(groupedData);
      series.appear(1000);
      series.events.once("datavalidated", function () {
          am5.array.each(series.dataItems, function (dataItem) {
            if (dataItem.get("valueX") === 0) {
              dataItem.set("valueXWorking", 0.5);
            }
          });
        });
    });
    this.chart.set("config", {
      type: 'bar',
      height: 500, // Adjust height to show all 8 labels
      stacked: false
    });

    // Add legend
    this.chart.set("legend", am5.Legend.new(this.root, {}));

    // Animate
    this.chart.appear(1000, 100);
  }

  shadeColor(color, percent) {
        let f = parseInt(color.slice(1), 16),
          t = percent < 0 ? 0 : 255,
          p = Math.abs(percent) / 100,
          R = f >> 16,
          G = f >> 8 & 0x00FF,
          B = f & 0x0000FF;
        return "#" + (
          0x1000000 +
          (Math.round((t - R) * p) + R) * 0x10000 +
          (Math.round((t - G) * p) + G) * 0x100 +
          (Math.round((t - B) * p) + B)
        ).toString(16).slice(1);
  }

  private calculateTotalData(): void {
    const maxTotalData = this.data
  .filter(item => item.hasOwnProperty('totalData'))
  .map(item => item.totalData);

    this.totalData = Math.max(...maxTotalData);
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

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}
