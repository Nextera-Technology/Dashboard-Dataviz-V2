import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  DashboardWidget,
  WidgetAction,
} from "app/shared/services/dashboard.service";

declare const am5: any;
declare const am5themes_Animated: any;
declare const am5map: any;
declare const am5geodata_franceLow: any;

@Component({
  selector: "app-map-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: "./map-widget.component.html",
  styleUrl: "./map-widget.component.scss",
})
export class MapWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() widget!: DashboardWidget;

  /**
   * Holds the computed total count of data points displayed by this map. It is
   * rendered in the template (see chart-legend div) so it must exist to satisfy
   * Angular template type-checking.
   */
  totalData: number = 0;

  private root: any;
  private chart: any;
  public chartId: string;

  constructor() {
    this.chartId = "map-chart-" + Math.random().toString(36).substr(2, 9);
  }

  onActionClick(action: WidgetAction): void {
    console.log("Action clicked:", action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    // Return placeholder icon URLs - in real app, these would be actual icons
    const iconMap: { [key: string]: string } = {
      "paragraph.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/paragraph.png",
      "excel.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/excel.png",
      "audience_4644048.png":
        "https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png",
    };

    return (
      iconMap[iconName] ||
      `https://staging-sg-map.s3.ap-southeast-1.amazonaws.com/public/${iconName}`
    );
  }

  ngAfterViewInit(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  ngOnInit(): void {
    // Ensure chartId matches template container id so we can locate the chart
    // Template uses: [id]="'map-chart-div-' + widget._id"
    this.chartId = 'map-chart-div-' + (this.widget?._id || this.widget?.id || '');

    // Component initialization
    this.calculateTotalData();
  }

  /**
   * Derive total data points from the widget's mapData structure.  Supports
   * both object and array forms for future flexibility.
   */
  private calculateTotalData(): void {
    const mapData: any = this.widget?.data?.mapData || this.widget?.data || {};

    // If mapData is array of objects with totalData field
    if (Array.isArray(mapData)) {
      if (mapData.length === 0) {
        this.totalData = 0;
        return;
      }
      this.totalData = mapData[0]?.totalData ?? mapData.length;
      return;
    }

    // If mapData is object of key -> value
    if (typeof mapData === 'object') {
      this.totalData = Object.keys(mapData).length;
      return;
    }

    // Fallback
    this.totalData = 0;
  }

  private initializeChart(): void {
    try {
      const container = document.getElementById(this.chartId);
      if (!container) {
        console.error("Map container not found:", this.chartId);
        return;
      }

      // Check if AmCharts is available
      if (typeof am5 === "undefined") {
        console.error("AmCharts not loaded");
        return;
      }

      // Check if France geodata is available
      if (typeof am5geodata_franceLow === "undefined") {
        console.error("France geodata not loaded");
        return;
      }

      // Create root
      this.root = am5.Root.new(this.chartId);
      this.root._logo.dispose();
      this.root.setThemes([am5themes_Animated.new(this.root)]);

      // Create chart
      this.chart = this.root.container.children.push(
        am5map.MapChart.new(this.root, {
          panX: "none",
          panY: "none",
          wheelY: "none",
          projection: am5map.geoMercator(),
        })
      );

      // Create polygon series
      const polygonSeries = this.chart.series.push(
        am5map.MapPolygonSeries.new(this.root, {
          geoJSON: am5geodata_franceLow,
          valueField: "count",
          categoryField: "name",
          calculateAggregates: true,
        })
      );

      // Configure polygon template
      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}: {count}",
        interactive: true,
        cursorOverStyle: "pointer",
      });

      // Enable hover state
      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(0xffd700),
      });

      // Allow color binding via data
      polygonSeries.mapPolygons.template.set("fillField", "fill");

      // Add fill adapter
      polygonSeries.mapPolygons.template.adapters.add(
        "fill",
        (fill: any, target: any) => {
          const dataItem = target.dataItem;
          if (dataItem && dataItem.dataContext && dataItem.dataContext.fill) {
            return dataItem.dataContext.fill;
          }
          return fill;
        }
      );

      // Prepare data
      const mapData = this.widget.data?.mapData || {};
      const dataItems = Object.entries(mapData).map(([id, value]) => {
        let numericValue =
          typeof value === "string"
            ? parseInt(value.replace(/[^\d]/g, ""))
            : value;

        return {
          id,
          value: numericValue,
          fill: this.getColorForRegion(id) || am5.color(0xd6efff),
        };
      });

      // Set data
      polygonSeries.data.setAll(dataItems);

      // Animate chart
      this.chart.appear(1000, 100);
    } catch (error) {
      console.error("Error initializing map chart:", error);
    }
  }

  private getColorForRegion(regionId: string): any {
    // Color mapping for French regions
    const colorMap: { [key: string]: any } = {
      "FR-PAC": am5.color(0x67b7dc), // Provence-Alpes-Côte d'Azur
      "FR-OCC": am5.color(0x6794dc), // Occitanie
      "FR-GES": am5.color(0x67b7dc), // Grand Est
      "FR-IDF": am5.color(0x6794dc), // Île-de-France
      "FR-NOR": am5.color(0x67b7dc), // Normandie
      "FR-ARA": am5.color(0x6794dc), // Auvergne-Rhône-Alpes
      "FR-HDF": am5.color(0x67b7dc), // Hauts-de-France
      "FR-NAQ": am5.color(0x6794dc), // Nouvelle-Aquitaine
      "FR-PDL": am5.color(0x67b7dc), // Pays de la Loire
      "FR-BRE": am5.color(0x6794dc), // Bretagne
      "FR-BFC": am5.color(0x67b7dc), // Bourgogne-Franche-Comté
      "FR-CVL": am5.color(0x6794dc), // Centre-Val de Loire
      "FR-COR": am5.color(0x67b7dc), // Corse
    };

    return colorMap[regionId];
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}
