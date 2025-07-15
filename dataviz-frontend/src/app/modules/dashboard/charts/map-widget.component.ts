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
  template: `
    <div
      class="widget-container"
      [style.background-color]="widget.data?.background || '#ffffff'"
    >
      <!-- Action Buttons -->
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

      <!-- Widget Content -->
      <div class="widget-header">
        <h3>{{ widget.title }}</h3>
      </div>
      <div class="widget-content">
        <div [id]="chartId" class="map-chart"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .widget-container {
        position: relative;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        padding: 20px;
        height: 100%;
        transition: all 0.3s ease;
      }

      .widget-container:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      /* Action Buttons */
      .button-container {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 5px;
        z-index: 10;
      }

      .widget-header h3 {
        text-align: center;
        font-size: 18px;
        color: #15616d;
        margin: 15px 0 15px 0;
      }

      .map-chart {
        width: 100%;
        height: 400px;
      }
    `,
  ],
})
export class MapWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() widget: any;
  @Input() data: any;

  private root: any;
  private chart: any;
  public chartId: string;

  constructor() {
    this.chartId = "map-chart-" + Math.random().toString(36).substr(2, 9);
  }

  onActionClick(action: string): void {
    console.log("Action clicked:", action);
    // Placeholder for future implementation
  }

  getActionIcon(iconName: string): string {
    // Return placeholder icon URLs - in real app, these would be actual icons
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

  ngAfterViewInit(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  ngOnInit(): void {
    // Component initialization
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
          valueField: "value",
          categoryField: "name",
          calculateAggregates: true,
        })
      );

      // Configure polygon template
      polygonSeries.mapPolygons.template.setAll({
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
      const mapData = this.widget.data || {};
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
