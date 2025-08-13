import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { InformationDialogComponent } from "app/shared/components/action-dialogs/information-dialog/information-dialog.component";

interface WidgetDataItem {
  name?: string | null;
  count?: number | null;
}

interface WidgetLike {
  _id?: string;
  title?: string;
  data?: WidgetDataItem[];
}

@Component({
  selector: "app-data-source-quick-info-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="title">
      <mat-icon class="mr-2">source</mat-icon>
      Data Source
    </h2>

    <mat-dialog-content class="content">
      <div class="widget-title" *ngIf="data?.widget?.title">{{ data.widget.title }}</div>

      <div *ngIf="uniqueNames.length > 0; else noData">
        <div class="summary">Total sources: {{ uniqueNames.length }}</div>
        <div class="names-list" [style.max-height.px]="240">
          <div class="name-item" *ngFor="let name of uniqueNames">{{ name }}</div>
        </div>
      </div>
      <ng-template #noData>
        <div class="empty">No data source available.</div>
      </ng-template>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="actions">
      <button mat-button (click)="dialogRef.close()">Close</button>
      <button mat-raised-button color="primary" (click)="openDetails()" *ngIf="data?.widget?._id">
        Details
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .title { display: flex; align-items: center; gap: 6px; margin: 0; }
      .content { min-width: 320px; }
      .widget-title { font-weight: 600; color: #334155; margin-bottom: 8px; }
      .summary { font-size: 12px; color: #475569; margin-bottom: 6px; }
      .names-list { overflow: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: #fafafa; }
      .name-item { font-size: 12px; color: #1f2937; padding: 4px 6px; border-radius: 4px; }
      .name-item + .name-item { margin-top: 4px; }
      .empty { font-size: 12px; color: #64748b; }
      .actions { padding-top: 8px; }
    `,
  ],
})
export class DataSourceQuickInfoDialogComponent {
  uniqueNames: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { widget: WidgetLike },
    public dialogRef: MatDialogRef<DataSourceQuickInfoDialogComponent>,
    private dialog: MatDialog,
  ) {
    this.uniqueNames = this.getUniqueDataSourceNames(data?.widget);
  }

  private getUniqueDataSourceNames(widget?: WidgetLike): string[] {
    if (!widget || !widget.data || widget.data.length === 0) return [];
    const names = widget.data.map(d => d?.name).filter((n): n is string => !!n);
    return Array.from(new Set(names));
  }

  openDetails(): void {
    if (!this.data?.widget) return;
    this.dialog.open(InformationDialogComponent, {
      width: "900px",
      maxWidth: "95vw",
      data: { widget: this.data.widget },
    });
  }
}


