import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
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
declare var am5xy: any;

@Component({
  selector: "app-sorted-bar-chart-widget",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent, TranslatePipe],
  templateUrl: './sorted-bar-chart-widget.component.html',
  styleUrls: ['./sorted-bar-chart-widget.component.scss']
})
export class SortedBarChartWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() widget: DashboardWidget;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  totalData: number = 0;
  private root: any;

  ngOnInit(): void {
    this.calculateTotalData();
  }

  ngAfterViewInit(): void {
    // Delay chart creation to ensure DOM and amCharts5 are ready
    setTimeout(() => {
      this.createChart();
    }, 500);
  }

  private calculateTotalData(): void {
    if (!this.widget?.data) {
      this.totalData = 0;
      return;
    }

    const dataArray = Array.isArray(this.widget.data) ? this.widget.data : [];
    this.totalData = dataArray.reduce((sum: number, item: any) => sum + (item.count ?? 0), 0);
  }

  private createChart(): void {
    if (!this.chartContainer?.nativeElement || !this.widget?.data) {
      return;
    }

    // Dispose existing chart
    if (this.root) {
      this.root.dispose();
    }

    // Initialize amCharts5 root - same pattern as information dialog
    this.root = am5.Root.new(this.chartContainer.nativeElement);
    this.root.setThemes([am5.Theme.new(this.root)]);

    // Create chart
    const chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        width: am5.percent(100),
        height: am5.percent(100),
        layout: this.root.verticalLayout,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 10,
        paddingRight: 40,
        paddingTop: 20,
        paddingBottom: 20
      })
    );

    // Prepare and sort data
    let chartData = [...this.widget.data];
    
    // Determine the category field (autonomyLevel for COMPETENCY_AUTONOMY or JOBDESC_COMPETENCY_AUTONOMY, name for others)
    const categoryField = ((this.widget as any).widgetType === 'JOBDESC_COMPETENCY_AUTONOMY') ? 'autonomyLevel' : 'name';
    
    // Transform data to match expected format with 'category' field
    chartData = chartData.map(item => ({
      ...item,
      category: item[categoryField] || item.name || item.autonomyLevel
    }));
    
    // Sort data by count in descending order
    chartData.sort((a, b) => (b.count || 0) - (a.count || 0));

    // Create Y-axis (categories) - exact pattern from information dialog
    const yRenderer = am5xy.AxisRendererY.new(this.root, {
      minGridDistance: 40,
      width: am5.percent(35),
      opposite: false,
      inside: false,
      inversed: true  // Invert the axis to show highest values at top
    });

    yRenderer.labels.template.setAll({
      oversizedBehavior: "wrap",
      maxWidth: 150,
      fontSize: 11,
      textAlign: "right",
      lineHeight: 1.2
    });

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        maxDeviation: 0,
        categoryField: "category",
        renderer: yRenderer
      })
    );

    // Create X-axis (values) - exact pattern from information dialog
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(this.root, {
        maxDeviation: 0,
        min: 0,
        numberFormatter: am5.NumberFormatter.new(this.root, {
          "numberFormat": "#,###a"
        }),
        extraMax: 0.2,
        renderer: am5xy.AxisRendererX.new(this.root, {
          strokeOpacity: 0.1,
          minGridDistance: 30
        })
      })
    );

    // Create series - exact pattern from information dialog
    const series = chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "count",
        categoryYField: "category",
        tooltip: am5.Tooltip.new(this.root, {
          labelText: "{categoryY}: {valueX}"
        })
      })
    );

    // Configure series appearance
    series.columns.template.setAll({
      cornerRadiusTR: 5,
      cornerRadiusBR: 5,
      stroke: am5.color("#ffffff"),
      strokeWidth: 1,
      strokeOpacity: 0.1,
      fill: am5.color("#4FC3F7"),
      tooltipText: "{categoryY}: {valueX}",
      cursorOverStyle: "pointer"
    });

    // Add data labels to show count values
    series.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        locationX: 1,
        locationY: 0.5,
        sprite: am5.Label.new(this.root, {
          text: "{valueX}",
          fill: am5.color("#000000"),
          centerY: am5.percent(50),
          centerX: am5.percent(0),
          populateText: true,
          fontSize: 11,
          fontWeight: "500",
          dx: -2 // Small offset to position label slightly to the right of the bar end
        })
      });
    });

    // Set data
    yAxis.data.setAll(chartData);
    series.data.setAll(chartData);

    // Set container height dynamically based on data length
    const containerHeight = Math.max(200, chartData.length * 40);
    this.chartContainer.nativeElement.style.height = `${containerHeight}px`;

    // Make chart appear
    series.appear(1000);
    chart.appear(1000, 100);
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}
