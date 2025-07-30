import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Apollo, gql } from 'apollo-angular';
import { DashboardBuilderService } from 'app/modules/admin/pages/dashboard-builder/dashboard-builder.service';
declare var am5: any;
declare var am5xy: any;
@Component({
  selector: 'app-information-dialog',
  imports: [CommonModule],
  templateUrl: './information-dialog.component.html',
  styleUrl: './information-dialog.component.scss'
})
export class InformationDialogComponent implements OnInit {
  private root2: any;
  widgetData: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;
  widget: any;
  widgetSource: any;
  scopeData: any;
  scopePoints: string[] = [];
  dataSources: any[] = [];
  totalDataSources: number = 0;
  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<InformationDialogComponent>,
    private dashboardBuilderService: DashboardBuilderService,
    private apollo: Apollo) {
    this.widgetData = data.widget;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getWidgetSource(this.widgetData._id);
  }

  getWidgetSource(widgetId: string) {
    this.apollo.mutate({
      mutation: gql`
        mutation GetWidgetDataSources($widgetId: String!) {
          getWidgetDataSources(widgetId: $widgetId) {
            widgetName
            scope {
              description
              points
            }
            analyse {
              description
              points
            }
            recommendation {
              description
              points
            }
            totalDataSources
            dataSources {
              name
              count
              wave
              code
              averageSalary
            }
            description
          }
        }
      `,
      variables: {
        widgetId: widgetId
      }
    }).subscribe((response: any) => {
      this.isLoading = false;
      this.widgetSource = response.data.getWidgetDataSources;
      this.totalDataSources = this.widgetSource.totalDataSources ? this.widgetSource.totalDataSources : 0;
      if (this.widgetSource && this.widgetSource.dataSources) {
        this.dataSources = this.widgetSource.dataSources;
        if (this.dataSources && this.dataSources.length > 0) {
          this.createChart();
        }
      }
      if (this.widgetSource && this.widgetSource.scope) {
        this.scopeData = this.widgetSource.scope;
        if (this.scopeData && this.scopeData.points) {
          this.scopePoints = this.scopeData.points;
        }

      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.root2) {
      this.root2.dispose();
      console.log("InformationDialogComponent: Disposed chart instance.");
    }
  }
  createChart() {

    const chartHeight = 50 * this.dataSources.length; // 50px per item, tune as needed
    const chartDiv = this.chartContainer.nativeElement;
    if (chartDiv) {
        chartDiv.style.height = `${chartHeight}px`;
    }
    console.log("chartDiv :", chartDiv);
    console.log("Creating chart with height:", chartHeight);
    
    this.root2 = am5.Root.new(this.chartContainer.nativeElement);
    this.root2.setThemes([am5.Theme.new(this.root2)]);

    



    // Create chart
    var chart2 = this.root2.container.children.push(am5xy.XYChart.new(this.root2, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      paddingLeft: 0
    }));

    // We don't want zoom-out button to appear while animating, so we hide it
    chart2.zoomOutButton.set("forceHidden", true);

    // Create axes
    var yRenderer2 = am5xy.AxisRendererY.new(this.root2, {
  minGridDistance: 20,
  width: am5.percent(30),  // Ensure space between label and bar
  opposite: false,
  inside: false,
});

yRenderer2.labels.template.setAll({
  oversizedBehavior: "truncate",
  maxWidth: 150,
  fontSize: 12,
  textAlign: "right"
});

var yAxis2 = chart2.yAxes.push(am5xy.CategoryAxis.new(this.root2, {
  maxDeviation: 0,
  categoryField: "name",
  renderer: yRenderer2,
  tooltip: am5.Tooltip.new(this.root2, { themeTags: ["axis"] })
}));
    var xAxis2 = chart2.xAxes.push(am5xy.ValueAxis.new(this.root2, {
      maxDeviation: 0,
      min: 0,
      numberFormatter: am5.NumberFormatter.new(this.root2, {
        "numberFormat": "#,###a"
      }),
      extraMax: 0.1,
      renderer: am5xy.AxisRendererX.new(this.root2, {
        strokeOpacity: 0.1,
        minGridDistance: 30
      })
    }));

    // Add series
    var series2 = chart2.series.push(am5xy.ColumnSeries.new(this.root2, {
      name: "Series 1",
      xAxis: xAxis2,
      yAxis: yAxis2,
      valueXField: "count",
      categoryYField: "name",
      tooltip: am5.Tooltip.new(this.root2, {
        pointerOrientation: "left",
        labelText: "{valueX}"
      })
    }));

    // Rounded corners for columns
    series2.columns.template.setAll({
      cornerRadiusTR: 5,
      cornerRadiusBR: 5,
      strokeOpacity: 0
    });

    if (series2.labels && series2.labels.template) {
      series2.labels.template.setAll({
        oversizedBehavior: "wrap",
        maxWidth: 200,
        fontSize: 12,
      });
    } else {
      console.warn("series2.labels.template is undefined");
    }
    // Make each column to be of a different color
    series2.columns.template.adapters.add("fill", function (fill, target) {
      return chart2.get("colors").getIndex(series2.columns.indexOf(target));
    });

    series2.columns.template.adapters.add("stroke", function (stroke, target) {
      return chart2.get("colors").getIndex(series2.columns.indexOf(target));
    });
    yAxis2.data.setAll(this.dataSources);
    series2.data.setAll(this.dataSources);
    sortCategoryAxis2();

    // Get series item by category
    function getSeriesItem2(category) {
      for (var i = 0; i < series2.dataItems.length; i++) {
        var dataItem = series2.dataItems[i];
        if (dataItem.get("categoryY") == category) {
          return dataItem;
        }
      }
    }

    chart2.set("cursor", am5xy.XYCursor.new(this.root2, {
      behavior: "none",
      xAxis: xAxis2,
      yAxis: yAxis2
    }));

    // Axis sorting
    function sortCategoryAxis2() {
      // Sort by value
      series2.dataItems.sort(function (x, y) {
        return x.get("valueX") - y.get("valueX"); // descending
      });

      // Go through each axis item
      am5.array.each(yAxis2.dataItems, function (dataItem) {
        // get corresponding series item
        var seriesDataItem = getSeriesItem2(dataItem.get("category"));

        if (seriesDataItem) {
          // get index of series data item
          var index = series2.dataItems.indexOf(seriesDataItem);
          // calculate delta position
          var deltaPosition = (index - dataItem.get("index", 0)) / series2.dataItems.length;
          // set index to be the same as series data item index
          dataItem.set("index", index);
          // set deltaPosition instanlty
          dataItem.set("deltaPosition", -deltaPosition);
          // animate delta position to 0
          dataItem.animate({
            key: "deltaPosition",
            to: 0,
            duration: 1000,
            easing: am5.ease.out(am5.ease.cubic)
          });
        }
      });

      // Sort axis items by index.
      yAxis2.dataItems.sort(function (x, y) {
        return x.get("index") - y.get("index");
      });
    }

    series2.appear(1000);
    chart2.appear(1000, 100);
  }
}

