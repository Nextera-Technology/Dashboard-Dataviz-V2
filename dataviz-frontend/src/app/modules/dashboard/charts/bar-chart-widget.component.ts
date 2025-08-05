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
import {
  DashboardWidget,
  WidgetAction,
} from "app/shared/services/dashboard.service";
import { ActionsButtonsComponent } from "app/shared/components/actions-buttons/actions-buttons.component";

declare var am5: any;
declare var am5xy: any;

@Component({
  selector: "app-bar-chart-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent],
  template: `
    <div
      class="chart-box relative"
      [style.background-color]="widget.data?.background || '#ffffff'"
    >
      <div class="chart-legend">Total Data : {{ totalData }}</div>
      <!-- Action Buttons -->
     <app-actions-buttons [widget]="widget"></app-actions-buttons>

      <!-- Widget Content -->
      <div class="chart-content">
        <h3 class="chart-title" style="margin-top: 16px;">{{ widget.title }}</h3>

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
        min-height: 150px;
        margin-bottom: 10px;
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

      /* Responsive */
      @media (max-width: 768px) {
        .chart-box {
          padding: 15px;
          min-height: 230px;
        }

        .chart-title {
          font-size: 16px;
        }

        .chart-container {
          height: 100%;
        }

        .legend-item {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class BarChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget: any;
  @Input() data: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  totalData: number = 0;

  private root: any;
  private chart: any;
  private xAxis: any;
  private yAxis: any;
  private series: any;

  ngOnInit(): void {
    this.calculateTotalData();
    if (this.widget.data) {
      if (this.widget.widgetType === 'POSITIONS_FUNCTIONS' || this.widget.widgetSubType === 'TOP_8_POSITIONS') {
        this.createTopChart();
      } else if (this.widget.widgetType === 'CONTRACT_TYPES' || this.widget.widgetSubType === 'CONTRACT_TYPE') {
        this.createContratChart();
      } else if (this.widget.widgetType === 'SURVEY_COMPLETION') {
        this.createSurveyChart();
      } else {
        this.createChart();
      }
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

  /*
      TOP_8_POSITIONS
  */
  createTopChart(): void {
    const originalData = [...this.data].reverse();

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

      series.bullets.push(() => {
        const label = am5.Label.new(this.root, {
          text: "{valueX}",
          populateText: true,
          centerY: am5.percent(50),
          centerX: am5.percent(0),
          paddingLeft: 10,
          fontSize: 10
        });

        // Match label color to bar fill color
        label.adapters.add("fill", (fill, target) => {
          const dataItem = target.dataItem;
          const jobTitle = dataItem?.dataContext?.name;
          if (jobTitle && this.jobBaseColors[jobTitle]) {
            return am5.color(this.shadeColor(this.jobBaseColors[jobTitle], esShade));
          }
          return fill;
        });

        return am5.Bullet.new(this.root, {
          locationX: 1,
          sprite: label
        });
      });
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
      stacked: false
    });

    // Add legend
    this.chart.set("legend", am5.Legend.new(this.root, {}));

    // Animate
    this.chart.appear(1000, 100);
  }


  createContratChart(): void {
    const originalData = [...this.data].reverse();

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
      series.bullets.push(() => {
        const label = am5.Label.new(this.root, {
          text: "{valueX}",
          populateText: true,
          centerY: am5.percent(50),
          centerX: am5.percent(0),
          paddingLeft: 10,
          fontSize: 10
        });

        // Match label color to bar fill color
        label.adapters.add("fill", (fill, target) => {
          const dataItem = target.dataItem;
          const jobTitle = dataItem?.dataContext?.name;
          if (jobTitle && this.jobBaseColors[jobTitle]) {
            return am5.color(this.shadeColor(this.jobBaseColors[jobTitle], esShade));
          }
          return fill;
        });

        return am5.Bullet.new(this.root, {
          locationX: 1,
          sprite: label
        });
      });

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
      stacked: false
    });

    // Add legend
    this.chart.set("legend", am5.Legend.new(this.root, {}));

    // Animate
    this.chart.appear(1000, 100);
  }


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

  private createChart(): void {
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root.setThemes([am5.Theme.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        layout: this.root.verticalLayout,
      })
    );

    // Y Axis (categories)
    this.yAxis = this.chart.yAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: "name",
        renderer: am5xy.AxisRendererY.new(this.root, { minGridDistance: 20 }),
      })
    );
    this.yAxis.data.setAll(this.widget.data);

    // X Axis (values)
    this.xAxis = this.chart.xAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererX.new(this.root, {}),
      })
    );

    // Series
    this.series = this.chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: "Values",
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueXField: "count",
        categoryYField: "name",
        fill: am5.color("#67b7dc"),
        stroke: am5.color("#67b7dc"),
      })
    );
    this.series.data.setAll(this.widget.data);

    // Bar colors
    this.series.columns.template.adapters.add(
      "fill",
      (fill: any, target: any) => {
        return am5.color(target.dataItem.dataContext.color || "#67b7dc");
      }
    );
    this.series.columns.template.adapters.add(
      "stroke",
      (stroke: any, target: any) => {
        return am5.color(target.dataItem.dataContext.color || "#67b7dc");
      }
    );

    // Tooltips
    this.series.columns.template.set("tooltipText", "{name}: {count}");

    // Appearance
    this.series.columns.template.setAll({
      cornerRadiusTL: 6,
      cornerRadiusBL: 6,
      strokeWidth: 2,
    });

    // Animate
    this.series.appear(1000);
    this.chart.appear(1000, 100);
  }

  // private calculateTotalData(): void {
  //   if (!this.widget?.data) {
  //     this.totalData = 0;
  //     return;
  //   }

  //   const dataArray = Array.isArray(this.widget.data) ? this.widget.data : [];
  //   if (dataArray.length) {
  //     this.totalData = dataArray[0]?.totalData ?? dataArray.reduce((sum: number, item: any) => sum + (item.count ?? 0), 0);
  //   } else if (this.widget.data?.series && Array.isArray(this.widget.data.series)) {
  //     const series0 = this.widget.data.series[0];
  //     this.totalData = series0?.totalData ?? this.widget.data.series.reduce((sum: number, item: any) => sum + (item.value ?? item.count ?? 0), 0);
  //   } else {
  //     this.totalData = this.widget.data.totalData ?? 0;
  //   }
  // }


  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}
