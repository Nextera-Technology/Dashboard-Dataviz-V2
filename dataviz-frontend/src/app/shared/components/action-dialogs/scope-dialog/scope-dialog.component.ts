import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { Apollo, gql } from 'apollo-angular';
import { DashboardBuilderService } from 'app/modules/admin/pages/dashboard-builder/dashboard-builder.service';

@Component({
  selector: 'app-scope-dialog',
  imports: [MatDialogModule,
    MatIconModule,
    MatButtonModule,
    CommonModule],
  templateUrl: './scope-dialog.component.html',
  styleUrl: './scope-dialog.component.scss'
})
export class ScopeDialogComponent implements OnInit {
  private root2: any;
  widgetData: any;
  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;
  widget: any;
  widgetSource: any;
  scopeData: any;
  scopePoints: string[] = [];
  dataSources: any[] = [];

  analyseData: any;
  recommendationData: any;

  analysePoints: string[] = [];
  recommendationPoints: string[] = [];
  isLoading: boolean = false;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ScopeDialogComponent>,
    private dashboardBuilderService: DashboardBuilderService,
    private apollo: Apollo) {
    this.widgetData = data.widget;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getWidgetSource(this.widgetData._id);

  }

  getInformationData() {
    this.dashboardBuilderService.getWidgetDataSource(this.widgetData._id).then(data => {
      console.log("Information Data:", data);
    });
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
      this.isLoading = true;
      this.widgetSource = response.data.getWidgetDataSources;
      this.isLoading = false;
      if (this.widgetSource && this.widgetSource.scope) {
        this.scopeData = this.widgetSource.scope;
        if (this.scopeData && this.scopeData.points) {
          this.scopePoints = this.scopeData.points;
        }
      }

      if (this.widgetSource && this.widgetSource.analyse) {
        this.analyseData = this.widgetSource.analyse;
        if (this.analyseData && this.analyseData.points) {
          this.analysePoints = this.analyseData.points;
        }
      }

      if (this.widgetSource && this.widgetSource.recommendation) {
        this.recommendationData = this.widgetSource.recommendation;
        if (this.recommendationData && this.recommendationData.points) {
          this.recommendationPoints = this.recommendationData.points;
        }
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}


