// src/app/components/france-regional-maps/france-regional-maps.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { MatIconModule } from "@angular/material/icon"; // For the no-data overlay icon
import { MatButtonModule } from "@angular/material/button";
import { ActionsButtonsComponent } from 'app/shared/components/actions-buttons/actions-buttons.component';

/* amCharts 5 Imports */
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import * as am5geodata_franceLow from "@amcharts/amcharts5-geodata/franceLow";

@Component({
  selector: "app-world-map-widget",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ActionsButtonsComponent, TranslatePipe],
  templateUrl: "./world-map-widget.component.html",
  styleUrl: "./world-map-widget.component.scss",
})
export class WorldMapWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() widget: any;
  public isNarrow = false;
  public isOneByTwo = false;
  public isOneByOne = false;

  public studentsMapId: string;
  public salaryMapId: string;
  studentsData = {};
  salaryData = {};
  studentDataList = [];
  salaryDataList = [];
  totalStudentData: number = 0;
  totalSalaryData: number = 0;

  private studentsRoot: am5.Root | null = null;
  private salaryRoot: am5.Root | null = null;
  private studentsSeries: am5map.MapPolygonSeries | null = null;
  private salarySeries: am5map.MapPolygonSeries | null = null;

  // Region names for tooltips
  private regionNames = {
    "FR-BRE": "Bretagne",
    "FR-NOR": "Normandie",
    "FR-HDF": "Hauts-de-France",
    "FR-GES": "Grand Est",
    "FR-PDL": "Pays de la Loire",
    "FR-CVL": "Centre-Val de Loire",
    "FR-IDF": "Île-de-France",
    "FR-BFC": "Bourgogne-Franche-Comté",
    "FR-NAQ": "Nouvelle-Aquitaine",
    "FR-ARA": "Auvergne-Rhône-Alpes",
    "FR-OCC": "Occitanie",
    "FR-PAC": "Provence-Alpes-Côte d'Azur",
    "FR-COR": "Corse",
  };
  // gradient based on bigger smaller size
  private manualColorMap = {
        "FR-PAC": am5.color(0x002F6C), // very dark blue (70)
        "FR-IDF": am5.color(0x174EA6), // dark blue (47)
        "FR-OCC": am5.color(0x2F66C7), // medium-dark blue (45)
        "FR-NAQ": am5.color(0x4785E8), // medium blue (31)
        "FR-GES": am5.color(0x66A2F2), // medium-light blue (30)
        "FR-ARA": am5.color(0x85B9F5), // lighter blue (21)
        "FR-HDF": am5.color(0x9FCBFA), // soft light blue (18)
        "FR-NOR": am5.color(0xB5D9FC), // pale blue (13)
        "FR-BRE": am5.color(0xCDE6FD), // very pale blue (9)
        "FR-PDL": am5.color(0xDEEFFD), // near-white blue (8)
        "FR-CVL": am5.color(0xEDF6FE), // slightly cooler near-white (2)
        "FR-BFC": am5.color(0xDEEFFD), // slightly warmer near-white (2)
        "FR-COR": am5.color(0xEDF6FE)  // light gray (1)
      };
  private manualColorMapSalaries = {
    "FR-IDF": am5.color(0x002f6c), // darkest blue (highest salary)
    "FR-PAC": am5.color(0x174ea6), // very dark blue
    "FR-ARA": am5.color(0x2f66c7), // dark blue
    "FR-NAQ": am5.color(0x4785e8), // medium blue
    "FR-GES": am5.color(0x4785e8), // medium blue
    "FR-OCC": am5.color(0x66a2f2), // light-medium blue
    "FR-BFC": am5.color(0x66a2f2), // light-medium blue
    "FR-PDL": am5.color(0x85b9f5), // pale-medium blue
    "FR-HDF": am5.color(0x9fcbfa), // pale blue
    "FR-BRE": am5.color(0xb5d9fc), // very pale blue
    "FR-NOR": am5.color(0xb5d9fc), // very pale blue
    "FR-COR": am5.color(0xedf6fe), // no data
    "FR-CVL": am5.color(0xedf6fe), // no data
  };
  public studentsLegendId: string; // ID for students legend container
  public salaryLegendId: string; // ID for salary legend container

  constructor(private zone: NgZone) {
    // Initialize with temporary IDs, will be set properly in ngOnInit when widget is available
    this.studentsMapId = "temp-students-map";
    this.salaryMapId = "temp-salary-map";
  }

  ngOnInit(): void {
    // Set consistent IDs based on widget ID for PDF export compatibility
    const widgetId = this.widget?._id || this.widget?.id || '';
    this.studentsMapId = `students-map-chart-div-${widgetId}`;
    this.salaryMapId = `salary-map-chart-div-${widgetId}`;
    this.studentsLegendId = `students-legend-${widgetId}`;
    this.salaryLegendId = `salary-legend-${widgetId}`;
    
    const colSize = Number(this.widget.columnSize || 1);
    const rowSize = Number(this.widget.rowSize || 1);
    
    this.isNarrow = colSize <= 1;
    this.isOneByTwo = colSize === 1 && rowSize === 2;
    this.isOneByOne = colSize === 1 && rowSize === 1;
    
    if (this.widget?.widgetSubType === 'STUDENT_REGION_DISTRIBUTION') {
      this.createStudentData();
    }else if (this.widget?.widgetSubType === 'REGION_SALARY_AVERAGE') {
      this.createSalaryData();
    }else{
      this._generateCustomLegend(
        this.studentsLegendId,
        this.studentsData,
        this.manualColorMap,
        (code, value) => `${this.regionNames[code] || code}: ${value}`
      );
    }
  }

  createStudentData(){
    if(this.widget?.data) {
      const data = this.widget.data;
      if(data) {
       this.totalStudentData = data[0].totalData || 0; 
        data.forEach((item: any) => { 
          this.studentsData[item.code] = item.count +" "+ item.percentage+"%";
          this.studentDataList.push(item);
        });
      }
    }
  }
  createSalaryData(){
    if(this.widget?.data) {
      const data = this.widget.data;
      if(data) {
        data.forEach((item: any) => { 
          this.salaryData[item.code] = item.averageSalary ? item.averageSalary + " €" : "0 €";
          this.salaryDataList.push(item);
          this.totalSalaryData = item.totalData || 0;
        });
      }
    }
  }

  getSortedStudentData(){
    this.studentDataList.sort((a, b) => b.count - a.count); // Sort by count descending
    return this.studentDataList;
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    });
  }

  private initializeCharts(): void {
    const studentsMapDiv = document.getElementById(this.studentsMapId);
    const salaryMapDiv = document.getElementById(this.salaryMapId);
    
    if (studentsMapDiv) {
      this.createFranceMap1(
        this.studentsMapId,
        this.studentsData,
        "studentsCount",
        this.studentsRoot
      );
    }

    if (salaryMapDiv) {
      this.createFranceMap1(
        this.salaryMapId,
        this.salaryData,
        "salaryAmount",
        this.salaryRoot
      );
    }

    const salaryLegendDiv = document.getElementById(this.salaryLegendId);
    if (salaryLegendDiv) {
      this._generateCustomLegend(
        this.salaryLegendId,
        this.salaryData,
        this.manualColorMapSalaries,
        (code, value) => `${this.regionNames[code] || code}: ${value}`
      );
    }
  }

  getRegionColor(regionCode: string): am5.Color {
    // Return the color based on the region code or a default color
    return this.manualColorMapSalaries[regionCode] || am5.color(0xd6efff); // Default light blue if no color specified
  }

  getStudentCount(regionCode: string): number {
    // Return the student count for the given region code
    return this.studentsData[regionCode] || 0;
  }
  getSalaryAmount(regionCode: string): string {
    // Return the salary amount for the given region code
    return this.salaryData[regionCode] || "0 €";
  }

  getRegionName(regionCode: string): string {
    // Return the friendly name for the region code
    return this.regionNames[regionCode] || regionCode;
  }


  createFranceMap1(divId, data, labelField, rootRef: am5.Root | null) {
    const chartDiv = document.getElementById(divId);

    // Dispose existing root for this map if present
    if (divId === this.studentsMapId && this.studentsRoot) {
      this.studentsRoot.dispose();
      this.studentsRoot = null;
      this.studentsSeries = null;
    }
    if (divId === this.salaryMapId && this.salaryRoot) {
      this.salaryRoot.dispose();
      this.salaryRoot = null;
      this.salarySeries = null;
    }

    if (!chartDiv) {
      return;
    }

    const root = am5.Root.new(divId);
    root._logo.dispose();
    root.setThemes([am5.Theme.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "none",
        panY: "none",
        wheelY: "none",
        projection: am5map.geoMercator(),
        paddingBottom: 20,
        paddingTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        layout: root.verticalLayout,
        height: am5.percent(100),
        width: am5.percent(100)
      })
    );

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_franceLow.default,
        valueField: "value",
        calculateAggregates: true
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}: {" + labelField + "}",
      interactive: true,
      cursorOverStyle: "pointer"
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0xffd700)
    });

    polygonSeries.mapPolygons.template.adapters.add("fill", (fill, target) => {
      const dataItem = target.dataItem;
      const dataContext = dataItem?.dataContext as { fill?: am5.Color };
      if (dataContext && dataContext.fill) {
        return dataContext.fill;
      }
      return fill;
    });

    const dataItems = Object.entries(data).map(([id, value]) => {
      let numericValue = typeof value === "string"
        ? parseInt(value.replace(/[^\d]/g, ""))
        : value;

      return {
        id,
        value: numericValue,
        [labelField]: value,
        fill: this.manualColorMap[id] || am5.color(0xd6efff)
      };
    });

    polygonSeries.data.setAll(dataItems);
    chart.appear(1000, 100);

    // Store root reference in container for PDF export
    (chartDiv as any)._amRoot = root;
    
    // Keep references for legend-hover interactions
    if (divId === this.studentsMapId) {
      this.studentsRoot = root;
      this.studentsSeries = polygonSeries;
    } else if (divId === this.salaryMapId) {
      this.salaryRoot = root;
      this.salarySeries = polygonSeries;
    }
  }

  onLegendEnter(type: 'students' | 'salary', regionCode: string): void {
    this._toggleRegionHover(type, regionCode, true);
  }

  onLegendLeave(type: 'students' | 'salary', regionCode: string): void {
    this._toggleRegionHover(type, regionCode, false);
  }

  private _toggleRegionHover(
    type: 'students' | 'salary',
    regionCode: string,
    isHover: boolean
  ): void {
    const series = type === 'students' ? this.studentsSeries : this.salarySeries;
    if (!series) {
      return;
    }
    const dataItem: any = (series as any).getDataItemById
      ? (series as any).getDataItemById(regionCode)
      : series.dataItems.find((di: any) => (di.get && di.get("id")) === regionCode || (di.dataContext && di.dataContext.id) === regionCode);
    if (!dataItem) {
      return;
    }
    const polygon: any = dataItem.get && dataItem.get("mapPolygon");
    if (!polygon) {
      return;
    }
    if (isHover) {
      if (typeof polygon.hover === "function") polygon.hover();
      if (typeof polygon.showTooltip === "function") polygon.showTooltip();
    } else {
      if (typeof polygon.unhover === "function") polygon.unhover();
      if (typeof polygon.hideTooltip === "function") polygon.hideTooltip();
    }
  }

  /**
   * Generic function to create a France regional map.
   * @param divId The ID of the HTML div element to render the map in.
   * @param data The data object for the map (e.g., studentsData, salaryData).
   * @param labelField The field name to display in the tooltip (e.g., "studentsCount", "salaryAmount").
   * @param minColor The color for the minimum value in the heat legend.
   * @param maxColor The color for the maximum value in the heat legend.
   * @param rootRef A reference to the root object (studentsRoot or salaryRoot) to manage its lifecycle.
   */
  // private createFranceMap(
  //   divId: string,
  //   data: { [key: string]: any },
  //   labelField: string,
  //   minColor: am5.Color,
  //   maxColor: am5.Color,
  //   rootRef: am5.Root | null
  // ): void {
  //   const chartDiv = document.getElementById(divId);
  //   console.log(
  //     `[FranceRegionalMapsComponent] createFranceMap called for ID: ${divId}. Div exists: ${!!chartDiv}. Current rootRef: ${!!rootRef}`
  //   );

  //   // Defensive disposal if a root already exists for this div
  //   if (rootRef) {
  //     console.warn(
  //       `[FranceRegionalMapsComponent] createFranceMap for ${divId}: Root already exists. Disposing defensively.`
  //     );
  //     rootRef.dispose();
  //     rootRef = null; // Clear reference
  //   }

  //   if (!chartDiv) {
  //     console.error(
  //       `[FranceRegionalMapsComponent] ERROR: Chart div '${divId}' not found for creating chart.`
  //     );
  //     return;
  //   }

  //   try {
  //     const root = am5.Root.new(divId);
  //     root._logo.dispose();
  //     root.setThemes([am5.Theme.new(root)]);

  //     const chart = root.container.children.push(
  //       am5map.MapChart.new(root, {
  //         panX: "none",
  //         panY: "none",
  //         wheelY: "none",
  //         projection: am5map.geoMercator(),
  //       })
  //     );

  //     const polygonSeries = chart.series.push(
  //       am5map.MapPolygonSeries.new(root, {
  //         geoJSON: am5geodata_franceLow.default, // Access the geoJSON property
  //         valueField: "value", // This will be the numeric value for heat rules/aggregates
  //         calculateAggregates: true,
  //       })
  //     );

  //     polygonSeries.mapPolygons.template.setAll({
  //       tooltipText: "{name}: {" + labelField + "} ", // Dynamic tooltip text
  //       interactive: true,
  //       cursorOverStyle: "pointer",
  //       stroke: am5.color(0xffffff), // White stroke for borders
  //       strokeWidth: 0.5,
  //     });

  //     polygonSeries.mapPolygons.template.states.create("hover", {
  //       fill: am5.color(0xffd700), // Golden color on hover
  //     });

  //     // Set heat rules for dynamic coloring based on 'value'
  //     // polygonSeries.set("heatRules", [
  //     //   {
  //     //     target: polygonSeries.mapPolygons.template,
  //     //     dataField: "value",
  //     //     min: minColor, // Lightest color for min value
  //     //     max: maxColor, // Darkest color for max value
  //     //     key: "fill",
  //     //   },
  //     // ]);

  //     // No need for fillField or fill adapter if using heatRules for primary coloring
  //     // polygonSeries.mapPolygons.template.set("fillField", "fill");
  //     // polygonSeries.mapPolygons.template.adapters.add("fill", (fill: any, target: any) => { ... });

  //     const dataItems = Object.entries(data).map(([id, val]) => {
  //       let numericValue: number = 0;
  //       // Attempt to parse numeric value for 'value' field (used for heat rules)
  //       if (typeof val === "string") {
  //         const parsed = parseInt(val.replace(/[^\d]/g, ""));
  //         numericValue = isNaN(parsed) ? 0 : parsed;
  //       } else {
  //         numericValue = val;
  //       }
  //       return {
  //         id: id,
  //         name: this.regionNames[id] || id, // Use friendly name from regionNames or fallback to ID
  //         value: numericValue, // Numeric value for heat rules
  //         [labelField]: val, 
  //          fill: this.manualColorMap[id] || am5.color(0xd6efff) 
  //         // The actual value (string or number) to display in tooltip
  //         // No 'fill' property needed here if using heatRules
  //       };
  //     });

  //     polygonSeries.data.setAll(dataItems);
  //     chart.appear(1000, 100);

  //     // // Create and configure HeatLegend
  //     // const heatLegend = chart.children.push(
  //     //   am5.HeatLegend.new(root, {
  //     //     orientation: "vertical", // Vertical legend
  //     //     startColor: minColor,
  //     //     endColor: maxColor,
  //     //     startText: "Low",
  //     //     endText: "High",
  //     //     stepCount: 5, // Number of steps in the legend
  //     //     height: am5.percent(80), // Adjust height as needed
  //     //     x: am5.percent(95), // Position on the right
  //     //     centerX: am5.percent(95),
  //     //     y: am5.percent(50), // Center vertically
  //     //     centerY: am5.percent(50),
  //     //   })
  //     // );

  //     // // Add labels to the heat legend
  //     // heatLegend.startLabel.setAll({
  //     //   fontSize: 12,
  //     //   fill: am5.color(0x000000),
  //     //   text: "Low",
  //     // });
  //     // heatLegend.endLabel.setAll({
  //     //   fontSize: 12,
  //     //   fill: am5.color(0x000000),
  //     //   text: "High",
  //     // });

  //     // Assign the created root to the correct class property
  //     if (divId === this.studentsMapId) {
  //       this.studentsRoot = root;
  //     } else if (divId === this.salaryMapId) {
  //       this.salaryRoot = root;
  //     }
  //     console.log(
  //       `[FranceRegionalMapsComponent] Chart for ${divId} created successfully.`
  //     );
  //   } catch (error) {
  //     console.error(
  //       `[FranceRegionalMapsComponent] Error initializing chart for ${divId}:`,
  //       error
  //     );
  //   }
  // }

  /**
   * Generates a custom HTML legend for the map.
   * @param containerId The ID of the HTML div element to append the legend items to.
   * @param data The data object used for the map.
   * @param colorMap The color map used for the map.
   * @param labelFormatter A function to format the label text for each legend item.
   */
  private _generateCustomLegend(
    containerId: string,
    data: { [key: string]: any },
    colorMap: { [key: string]: am5.Color },
    labelFormatter: (regionCode: string, value: any) => string
  ): void {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    container.innerHTML = ""; // Clear previous content

    // Sort data for consistent legend order (e.g., by value or alphabetically by region name)
    const sortedEntries = Object.entries(data).sort(
      ([idA, valA], [idB, valB]) => {
        // Example: Sort by numeric value descending, then by region name ascending
        let numericValA =
          typeof valA === "string"
            ? parseInt(valA.replace(/[^\d]/g, "")) || 0
            : valA;
        let numericValB =
          typeof valB === "string"
            ? parseInt(valB.replace(/[^\d]/g, "")) || 0
            : valB;

        if (numericValA !== numericValB) {
          return numericValB - numericValA; // Descending by value
        }
        return (this.regionNames[idA] || idA).localeCompare(
          this.regionNames[idB] || idB
        ); // Ascending by name
      }
    );

    sortedEntries.forEach(([regionCode, value]) => {
      const color = colorMap[regionCode] || am5.color(0xd6efff); // Default light blue if no color specified
      const item = document.createElement("div");
      item.className = "legend-item";

      const colorBox = document.createElement("span");
      colorBox.className = "legend-color";
      colorBox.style.backgroundColor = color.toCSSHex();

      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = labelFormatter(regionCode, value);

      item.appendChild(colorBox);
      item.appendChild(label);
      container.appendChild(item);
    });
  }
  /**
   * Disposes all amCharts roots to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      if (this.studentsRoot) {
        try {
          this.studentsRoot.dispose();
        } catch (e) {
          // Ignore disposal errors
        } finally {
          this.studentsRoot = null;
        }
      }
      if (this.salaryRoot) {
        try {
          this.salaryRoot.dispose();
        } catch (e) {
          // Ignore disposal errors
        } finally {
          this.salaryRoot = null;
        }
      }
    });
  }
}
