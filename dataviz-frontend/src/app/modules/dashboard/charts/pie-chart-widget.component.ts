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
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';

declare var am5: any;
declare var am5percent: any;

@Component({
  selector: "app-pie-chart-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent, TranslatePipe],
  template: `
    <div
      class="chart-box"
      [ngClass]="{ 'list-mode': displayMode === 'list', 'short-row': (widget?.rowSize || 1) <= 1 }"
      [style.background-color]="widget?.background || '#ffffff'"
    >
     <!-- Action Buttons -->
      <app-actions-buttons [widget]="widget"></app-actions-buttons>

      <div class="chart-content">
        <h3 class="chart-title">{{ widget.title }}</h3>
<br>
        <div #chartContainer class="chart-container"></div>

        <!-- Custom Legend for LIST mode (2 columns x 3 rows with pagination) -->
        <div *ngIf="displayMode === 'list' && legendItems && legendItems.length" class="legend-grid-container">
          <div class="legend-grid" [style.grid-template-columns]="legendGridColumns">
            <div
              class="legend-item"
              *ngFor="let item of pagedLegendItems; trackBy: trackByLegend"
              [class.disabled]="item.hidden"
              (mouseenter)="onLegendEnter(item.index)"
              (mouseleave)="onLegendLeave(item.index)"
              (click)="toggleLegendItem(item.index)"
            >
              <span class="legend-color" [style.background-color]="item.color"></span>
              <span class="legend-label" [title]="item.name">{{ item.name }}</span>
              <span class="legend-value">= {{ item.value }} ({{ item.percent | number:'1.0-1' }}%)</span>
            </div>
          </div>

          <div class="legend-nav" *ngIf="legendItems && legendItems.length">
            <button mat-icon-button class="nav-btn" [disabled]="currentPage === 1" (click)="prevPage()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <span class="page-indicator">{{ 'shared.pagination.page' | translate }} {{ currentPage }}/{{ totalPages }}</span>
            <button mat-icon-button class="nav-btn" [disabled]="currentPage === totalPages" (click)="nextPage()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>

        <!-- Manual Legend -->
        <div class="chart-legend" >
          {{ 'shared.worldMapWidget.students_total_label' | translate }} {{ data && data.length && data[0].totalData ?? data[0].totalData || 0 }}
        </div>
      </div>
      
      <!-- Buttons to toggle display mode -->
      <div class="display-mode-toggle">
        <button (click)="setDisplayMode('side')" [class.active]="displayMode === 'side'">{{ 'shared.display.side' | translate }}</button>
        <button (click)="setDisplayMode('list')" [class.active]="displayMode === 'list'">{{ 'shared.display.list' | translate }}</button>
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
        padding-bottom: 50px; /* Add padding to prevent overlap */
        transition: all 0.3s ease;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        overflow: hidden; /* Ensure content never overflows the tile */
      }

      /* More compact spacing for 1-row tiles (e.g., 1x1 or 2x1) */
      .chart-box.short-row {
        padding: 12px;
      }
      .chart-box.short-row .chart-title {
        margin: 10px 0 8px 0;
        font-size: 16px;
      }

      .display-mode-toggle {
        position: absolute;
        bottom: 8px;
        left: 8px;
        z-index: 100;
        display: flex;
        gap: 4px;
        background-color: rgba(240, 240, 240, 0.9);
        padding: 4px;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }

      .display-mode-toggle button {
        border: 1px solid transparent;
        background-color: transparent;
        padding: 4px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: #555;
        transition: all 0.2s ease-in-out;
      }

      .display-mode-toggle button.active {
        background-color: #ffffff;
        border-color: #ddd;
        color: #0d6efd;
        font-weight: 600;
      }

      .display-mode-toggle button:not(.active):hover {
        background-color: rgba(0, 0, 0, 0.05);
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
        top: 12px;
        left: 14px;
        z-index: 2;
        background: rgba(255,255,255,0.85);
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #15616d;
        pointer-events: none;
        text-align: left;
      }

      .chart-title {
        font-family: 'Inter';
        font-size: 18px;
        font-weight: 600;
        color: #00454d;
        margin: 15px 0 15px 0;
        line-height: 1.3;
      }

      .chart-container {
        height: 100%;
        width: 100%;
        min-height: 100px;
        max-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* In list mode, avoid centering so chart + legend stack from top and keep legend visible */
      .chart-box.list-mode .chart-container {
        align-items: flex-start;
        justify-content: flex-start;
      }

      /* In list mode for 1x1 tiles, shrink chart area to free space for legend */
      .chart-box.list-mode.short-row .chart-container {
        min-height: 70px;
        height: 70px;
      }

      /* Manual Legend - Keep if you intend to use it, otherwise remove */
      .manual-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }

      /* New grid legend */
      .legend-grid-container {
        margin-top: 8px;
        width: 100%;
      }
      /* Prevent legend from overflowing on very small tiles */
      .chart-box.list-mode.short-row .legend-grid-container {
        overflow: hidden;
        padding-bottom: 26px; /* reserve space for overlay pagination */
      }
      .legend-grid {
        display: grid;
        grid-auto-rows: minmax(28px, auto); /* 3 rows tall per page via page size */
        column-gap: 12px;
        row-gap: 6px;
        align-items: center;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: background-color 0.2s ease, opacity 0.2s ease;
        user-select: none;
      }
      .legend-item:hover { background-color: rgba(0,0,0,0.05); }
      .legend-item.disabled { 
        opacity: 0.5; 
        text-decoration: line-through;
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
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 120px;
      }

      .legend-value {
        font-weight: 600;
        color: #263238;
        font-size: 12px;
      }

      .legend-visibility {
        font-size: 16px;
        color: #9e9e9e;
      }

      .legend-nav {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        padding-top: 6px;
      }
      .legend-nav .nav-btn[disabled] { opacity: 0.4; }
      .legend-nav .page-indicator { font-size: 12px; color: #607d8b; }

      /* On very small tiles (1x1), overlay pagination at bottom so it never gets clipped */
      .chart-box.list-mode.short-row .legend-nav {
        position: absolute;
        bottom: 8px;
        right: 8px;
        left: auto;
        transform: none;
        z-index: 101; /* above display-mode toggle */
        background: rgba(255,255,255,0.92);
        padding: 2px 6px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }

      /* Smaller controls in 1x1 list mode */
      .chart-box.list-mode.short-row .legend-nav .nav-btn {
        width: 26px;
        height: 26px;
        min-width: 26px;
        padding: 0;
      }
      .chart-box.list-mode.short-row .legend-nav .nav-btn .mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
      }
      .chart-box.list-mode.short-row .legend-nav .page-indicator {
        font-size: 11px;
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
    `,
  ],
})
export class PieChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget: any;
  @Input() data: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;
  public displayMode: "side" | "list" = "side";

  // Legend state (LIST mode)
  public legendItems: Array<{ index: number; name: string; value: number; color: string; hidden: boolean; percent: number }> = [];
  // Legend layout state (dynamic for small widgets)
  public pageSize = 6; // default 2 columns x 3 rows
  public legendGridColumns = '1fr 1fr';
  public currentPage = 1;
  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.legendItems.length / this.pageSize));
  }
  public get pagedLegendItems() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.legendItems.slice(start, start + this.pageSize);
  }

  actions: [
    {
      id: "1";
      type: "primary";
      title: "Info";
      label: "Info";
      icon: "paragraph.png";
      action: "info";
    },
    {
      id: "2";
      type: "secondary";
      title: "Export";
      label: "Export";
      icon: "excel.png";
      action: "export";
    },
    {
      id: "3";
      type: "secondary";
      title: "Analysis";
      label: "Analysis";
      icon: "audience_4644048.png";
      action: "analysis";
    },
  ];
  private root: any;
  private chart: any;
  private series: any;

  ngOnInit(): void {
    if (this.data) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  public setDisplayMode(mode: "side" | "list"): void {
    if (this.displayMode !== mode) {
      this.displayMode = mode;
      if (this.data) {
        this.createChart();
      }
    }
  }

  private createChart(): void {
    if (this.root) {
      this.root.dispose();
    }
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root._logo.dispose();
    this.root.setThemes([am5.Theme.new(this.root)]);
    
    const data = this.data.map((item: any) => ({
      name: item.name,
      value: item.count || item.value,
      color: item.color,
    }));

    const colSize = Number(this.widget.columnSize || 1);
    const rowSize = Number(this.widget.rowSize || 1);
    const isSmall = colSize <= 1 && rowSize <= 1; // strictly 1x1
    const isShortRow = rowSize <= 1; // includes 1x1 and 2x1

    if (this.displayMode === 'side') {
      // SIDE MODE: Labels on chart
      this.chart = this.root.container.children.push(
        am5percent.PieChart.new(this.root, {
          layout: this.root.horizontalLayout,
          innerRadius: am5.percent(50),
          radius: am5.percent(60),
        })
      );
      this.series = this.chart.series.push(
        am5percent.PieSeries.new(this.root, {
          name: "Series",
          categoryField: "name",
          valueField: "value",
          alignLabels: false,
          fillField: "color",
        })
      );
      this.series.data.setAll(data); // Set data before configuring labels
      this.series.labels.template.setAll({
        text: "{category}: {value} ({valuePercentTotal.formatNumber('#.0')}%)",
        fontSize: "12px",
        maxWidth: 140, // Increased maxWidth to accommodate longer text
        oversizedBehavior: "wrap",
        paddingBottom: 5, // Reduced padding for better spacing
        paddingRight: 5, // Reduced right padding to prevent clipping
        paddingLeft: 5, // Added left padding
        paddingTop: 5, // Added top padding
        forceHidden: false,
        radius: 10, // Reduced radius for better label positioning
      });

    } else {
      // LIST MODE: Custom Grid Legend at bottom
      this.chart = this.root.container.children.push(
        am5percent.PieChart.new(this.root, {
          layout: this.root.verticalLayout,
          innerRadius: am5.percent(50),
          radius: isSmall ? am5.percent(30) : (isShortRow ? am5.percent(40) : am5.percent(60)),
        })
      );
      this.series = this.chart.series.push(
        am5percent.PieSeries.new(this.root, {
          name: "Series",
          categoryField: "name",
          valueField: "value",
          alignLabels: false,
          fillField: "color",
        })
      );
      this.series.data.setAll(data); // Set data before legend
      this.series.labels.template.set("forceHidden", true);
      this.series.ticks.template.set("forceHidden", true);

      // Build custom legend data from series and reset pagination
      this.currentPage = 1;
      // Adjust legend layout based on widget tile size
      this.recomputeLegendLayout(colSize, rowSize);
      this.updateLegendFromSeries();
    }

    // Common settings for both modes
    this.series.slices.template.setAll({
        tooltipText:  "{category}: {value} ({valuePercentTotal.formatNumber('#.0')}%)",
        stroke: am5.color(0xffffff),
        strokeWidth: 1.5,
        cornerRadius: 5,
        shiftRadius: 3,
    });
    this.series.set(
      "colors",
      am5.ColorSet.new(this.root, {
        colors: data.map((item: any) => am5.color(item.color)),
      })
    );
    this.series.appear(1000, 100);
  }

  onActionClick(action: string): void {
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

  // ----- Custom Legend helpers -----
  private updateLegendFromSeries(): void {
    if (!this.series || !this.series.dataItems) {
      this.legendItems = [];
      return;
    }
    this.legendItems = this.series.dataItems.map((di: any, idx: number) => {
      const slice = di.get ? di.get("slice") : di.slice;
      const fill = slice?.get ? slice.get("fill") : undefined;
      
      // Always use original data color first
      let color = this.data?.[idx]?.color;
      
      // If no color in original data, try to get from amCharts slice
      if (!color) {
        const colors = ['#6794DC', '#6771DC', '#8067DC', '#A367DC', '#C767DC', '#DC67CE'];
        color = colors[idx % colors.length];
      }
      
      // Get percentage - recalculate based on visible items only
      const visibleItems = this.legendItems.filter(item => !item.hidden);
      let calculatedPercent;
      
      if (visibleItems.length === 0 || !this.legendItems.length) {
        // Initial calculation from all data
        const totalValue = this.data?.reduce((sum, item) => sum + (item.count || item.value || 0), 0) || 1;
        const itemValue = this.data?.[idx]?.count || this.data?.[idx]?.value || 0;
        calculatedPercent = Math.round((itemValue / totalValue) * 100 * 10) / 10; // 1 decimal place
      } else {
        // Recalculate based on visible items only
        const visibleTotal = this.data
          ?.filter((_, i) => !this.legendItems.find(li => li.index === i)?.hidden)
          ?.reduce((sum, item) => sum + (item.count || item.value || 0), 0) || 1;
        const itemValue = this.data?.[idx]?.count || this.data?.[idx]?.value || 0;
        const isCurrentHidden = this.legendItems.find(li => li.index === idx)?.hidden;
        
        if (isCurrentHidden) {
          calculatedPercent = 0;
        } else {
          calculatedPercent = Math.round((itemValue / visibleTotal) * 100 * 10) / 10; // 1 decimal place
        }
      }
      
      // Preserve existing hidden state if legend items already exist
      const existingItem = this.legendItems.find(li => li.index === idx);
      const isHidden = existingItem ? existingItem.hidden : false;
      
      return {
        index: idx,
        name: di.get ? (di.get("category") ?? this.data?.[idx]?.name) : this.data?.[idx]?.name,
        value: this.data?.[idx]?.count || this.data?.[idx]?.value || 0,
        color,
        hidden: isHidden,
        percent: calculatedPercent,
      };
    });
  }

  trackByLegend = (_: number, item: { index: number }) => item.index;

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  private getSliceByIndex(index: number): any | null {
    if (!this.series || !this.series.dataItems || !this.series.dataItems[index]) return null;
    const di = this.series.dataItems[index];
    return di.get ? di.get("slice") : di.slice; // compatibility
  }

  onLegendEnter(index: number): void {
    const slice = this.getSliceByIndex(index);
    try {
      if (slice && slice.hover) slice.hover();
    } catch {}
  }
  onLegendLeave(index: number): void {
    const slice = this.getSliceByIndex(index);
    try {
      if (slice && slice.unhover) slice.unhover();
    } catch {}
  }

  toggleLegendItem(index: number): void {
    const item = this.legendItems.find((x) => x.index === index);
    if (!item) return;

    const di = this.series?.dataItems?.[index];
    if (!di) return;

    try {
      if (item.hidden) {
        // Show the slice
        if (di.show) {
          di.show();
        }
        item.hidden = false;
      } else {
        // Hide the slice
        if (di.hide) {
          di.hide();
        }
        item.hidden = true;
      }
      
      // Recalculate percentages for all items after toggle
      this.updateLegendFromSeries();
    } catch (e) {
      console.error('Error toggling slice:', e);
    }
  }

  // Compute legend layout for LIST mode to avoid overflow on small tiles
  private recomputeLegendLayout(colSize: number, rowSize: number): void {
    // Defaults: 2 columns x 3 rows
    let columns = 2;
    let rows = 3;

    // Extremely small (1x1): 1 column x 3 rows
    if (colSize <= 1 && rowSize <= 1) {
      columns = 1;
      rows = 2; // Reduce rows for strict 1x1 to prevent overflow
    }
    // Short height (<=1 row): 2 columns x 2 rows
    else if (rowSize <= 1) {
      columns = 2;
      rows = 2; // 4 items per page
    }
    // Narrow but taller (<=1 column and >1 row): 1 column x 5 rows
    else if (colSize <= 1) {
      columns = 1;
      rows = 5; // 5 items per page
    }

    this.pageSize = Math.max(1, columns * rows);
    this.legendGridColumns = columns === 1 ? '1fr' : '1fr 1fr';
    this.currentPage = 1;
  }
}
