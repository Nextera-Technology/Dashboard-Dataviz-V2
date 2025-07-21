// src/app/components/widgets/sankey-chart-widget/sankey-chart-widget.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  NgZone,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as am5 from "@amcharts/amcharts5";
import * as am5flow from "@amcharts/amcharts5/flow"; // For Sankey chart
import {
  DashboardWidget,
  WidgetAction,
} from "app/shared/services/dashboard.service";

interface Widget {
  /* ... (same Widget interface as above) ... */
}

@Component({
  selector: "app-sankey-chart-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sankey-chart-widget.component.html",
  styleUrl: "./sankey-chart-widget.component.scss",
})
export class SankeyChartWidgetComponent implements OnInit, OnDestroy {
  @Input() widget = null;
  @Input() data: any;

  get totalData(): number {
    if (!this.data || this.data.length === 0) {
      return 0;
    }
    const first = this.data[0];
    if (first && first.totalData !== undefined) {
      return first.totalData;
    }
    return Array.isArray(this.data)
      ? this.data.length
      : 0;
  }

  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  private root: any;
  private chart: any;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      if (this.widget._id) {
        this.createChart();
      }
    });
  }
  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  private createChart(): void {
    this.root = am5.Root.new(`sankey-chart-div-${this.widget._id}`);
    this.root.setThemes([am5.Theme.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5flow.Sankey.new(this.root, {
        orientation: "horizontal",
        sourceIdField: "from",
        targetIdField: "to",
        valueField: "value",
      })
    );

    // Only set links data
    this.chart.data.setAll(this.data);

    // Style nodes and links
    if (this.chart?.nodes?.template) {
      this.chart.nodes.template.setAll({
        fill: am5.color("#67b7dc"),
        stroke: am5.color("#15616D"),
        strokeWidth: 2,
        paddingTop: 1,
        paddingBottom: 1,
      });
    }

    this.chart.links.template.setAll({
      fill: am5.color("#67b7dc"),
      stroke: am5.color("#15616D"),
      strokeWidth: 1,
    });

    this.chart.appear(1000, 100);
  }

  onActionClick(action: WidgetAction): void {
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
}
