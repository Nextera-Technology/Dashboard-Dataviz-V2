import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { DashboardBuilderService } from '../dashboard-builder/dashboard-builder.service';
import { Router } from '@angular/router';
import { ShareDataService } from 'app/shared/services/share-data.service';
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { TranslationService } from 'app/shared/services/translation/translation.service';
import { MatDialog } from '@angular/material/dialog';
import { DashboardFormDialogComponent, DashboardFormDialogData } from '../../components/dashboard-form-dialog/dashboard-form-dialog.component';

interface Section {
  _id?: string;
  name?: string;
  background?: string;
  title: string;
  widgetIds: any[];
  status?: string;
}

interface Dashboard {
  _id?: string;
  name?: string;
  sectionIds: Section[];
  sources?: { certification: string | null; classes: string[] | null }[];
  title: string;
  status?: string;
  type?: string;
  isArchived?: boolean;
  typeOfUsage?: string;
  duplicationType?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
  };
}

@Component({
  selector: 'app-dashboard-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    AdminLayoutComponent,
    TranslatePipe
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: (translation: TranslationService) => {
        const intl = new MatPaginatorIntl();
        const setLabels = () => {
          intl.itemsPerPageLabel = translation.translate('admin.userManagement.paginator.items_per_page') || 'Items per page:';
          intl.changes.next();
        };
        // initial
        setLabels();
        // update on language change
        translation.translationsLoaded$.subscribe(() => setLabels());
        return intl;
      },
      deps: [TranslationService]
    }
  ],
  template: `
    <app-admin-layout [fullBleed]="true">
      <div class="dashboard-table-container">
        <!-- Horizontal Navigation Bar (Card | Table) -->
        <div class="navigation-bar" style="margin-bottom: 24px;">
          <div style="backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.7); border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 8px; display: inline-flex; gap: 8px;">
            <button
              (click)="navigateToCardView()"
              class="nav-btn"
              style="color: #64748b; background: transparent; border: none; cursor: pointer; padding: 8px 24px; border-radius: 12px; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; gap: 8px;"
            >
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">view_module</mat-icon>
              <span>Card</span>
            </button>
            <button
              class="nav-btn active"
              style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; cursor: pointer; padding: 8px 24px; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s; display: flex; align-items: center; gap: 8px;"
            >
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">table_view</mat-icon>
              <span>Table</span>
            </button>
          </div>
        </div>

        <!-- Tabs for Templates, Created, Archived -->
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="dashboard-tabs">
          <mat-tab label="{{ 'admin.dashboardTable.tabs.templates' | translate }}">
            <div class="tab-content">
              <div class="dv-table-header">
                <h2>{{ 'admin.dashboardTable.headers.templates' | translate }}</h2>
                <div class="header-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-icon matPrefix>search</mat-icon>
                    <input matInput placeholder="{{ 'admin.dashboardTable.search_placeholder' | translate }}" (input)="onSearchInput('templates', $event)" [value]="searchValues.templates" />
                    <button mat-icon-button matSuffix *ngIf="searchValues.templates" aria-label="Clear search" (click)="clearSearch('templates')">
                      <mat-icon>close</mat-icon>
                    </button>
                  </mat-form-field>
                  <div class="bulk-actions" *ngIf="templatesSelection.hasValue()">
                    <button mat-button color="warn" (click)="archiveSelected('templates')">
                      <mat-icon>archive</mat-icon>
                      {{ 'admin.dashboardTable.bulk.archive_selected' | translate }} ({{ templatesSelection.selected.length }})
                    </button>
                  </div>
                </div>
              </div>
              <div class="table-container">
                <!-- Loading Spinner -->
                <div class="loading-container" *ngIf="isLoading">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>{{ 'admin.dashboardTable.loading' | translate }}</p>
                </div>
                
                <table mat-table [dataSource]="templatesData" class="dashboard-table" matSort #templatesSort="matSort" [matSortDisableClear]="false" *ngIf="!isLoading">
                  <!-- Checkbox Column -->
                  <ng-container matColumnDef="select">
                    <th mat-header-cell *matHeaderCellDef>
                      <mat-checkbox (change)="$event ? masterToggle('templates') : null"
                                    [checked]="templatesSelection.hasValue() && isAllSelected('templates')"
                                    [indeterminate]="templatesSelection.hasValue() && !isAllSelected('templates')">
                      </mat-checkbox>
                    </th>
                    <td mat-cell *matCellDef="let row">
                      <mat-checkbox (click)="$event.stopPropagation()"
                                    (change)="$event ? templatesSelection.toggle(row) : null"
                                    [checked]="templatesSelection.isSelected(row)">
                      </mat-checkbox>
                    </td>
                  </ng-container>

                  <!-- Name Column -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.name' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ element.name || element.title }}</td>
                  </ng-container>

                  <!-- Date Created Column -->
                  <ng-container matColumnDef="dateCreated">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.dateCreated' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getCreatedDate(element) | date:'short' }}</td>
                  </ng-container>

                  <!-- Date Modified Column -->
                  <ng-container matColumnDef="dateModified">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.dateModified' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getModifiedDate(element) | date:'short' }}</td>
                  </ng-container>

                  <!-- Type Column -->
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.type' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="type-badge type-dashboard" style="text-align:center">
                        {{ getDashboardType(element) }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Creator Column -->
                  <ng-container matColumnDef="creator">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.creator' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getCreatorName(element) }}</td>
                  </ng-container>

                  <!-- Number of Sections Column -->
                  <ng-container matColumnDef="sections">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.sections' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getSectionCount(element) }}</td>
                  </ng-container>

                  <!-- Data Source Column -->
                  <ng-container matColumnDef="dataSource">
                    <th mat-header-cell *matHeaderCellDef>{{ 'admin.dashboardTable.columns.dataSource' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <div class="data-source">
                        <div class="source-title">{{ getDataSourceInfo(element).title }}</div>
                        <div class="source-classes" *ngIf="getDataSourceInfo(element).classes.length > 0">
                          {{ getDataSourceInfo(element).classes.join(', ') }}
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>{{ 'admin.dashboardTable.columns.actions' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #actionsMenu="matMenu">
                        <button mat-menu-item (click)="viewDashboard(element)">
                          <mat-icon>visibility</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.view' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="manageDashboard(element)">
                          <mat-icon>edit</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.manage' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="exportToPDF(element)">
                          <mat-icon>picture_as_pdf</mat-icon>
                          <span>{{ 'shared.export.pdf.button' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="archiveDashboard(element)">
                          <mat-icon>archive</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.archive' | translate }}</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>
              <mat-paginator #templatesPaginator [pageSize]="5" [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>

          <mat-tab label="{{ 'admin.dashboardTable.tabs.created' | translate }}">
            <div class="tab-content">
              <div class="dv-table-header">
                <h2>{{ 'admin.dashboardTable.headers.created' | translate }}</h2>
                <div class="header-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-icon matPrefix>search</mat-icon>
                    <input matInput placeholder="{{ 'admin.dashboardTable.search_placeholder' | translate }}" (input)="onSearchInput('created', $event)" [value]="searchValues.created" />
                    <button mat-icon-button matSuffix *ngIf="searchValues.created" aria-label="Clear search" (click)="clearSearch('created')">
                      <mat-icon>close</mat-icon>
                    </button>
                  </mat-form-field>
                  <div class="bulk-actions" *ngIf="createdSelection.hasValue()">
                    <button mat-button color="warn" (click)="archiveSelected('created')">
                      <mat-icon>archive</mat-icon>
                      {{ 'admin.dashboardTable.bulk.archive_selected' | translate }} ({{ createdSelection.selected.length }})
                    </button>
                  </div>
                </div>
              </div>
              <!-- Similar table structure for created dashboards -->
              <div class="table-container">
                <table mat-table [dataSource]="createdData" class="dashboard-table" matSort #createdSort="matSort" [matSortDisableClear]="false">
                  <!-- Same column definitions as templates -->
                  <ng-container matColumnDef="select">
                    <th mat-header-cell *matHeaderCellDef>
                      <mat-checkbox (change)="$event ? masterToggle('created') : null"
                                    [checked]="createdSelection.hasValue() && isAllSelected('created')"
                                    [indeterminate]="createdSelection.hasValue() && !isAllSelected('created')">
                      </mat-checkbox>
                    </th>
                    <td mat-cell *matCellDef="let row">
                      <mat-checkbox (click)="$event.stopPropagation()"
                                    (change)="$event ? createdSelection.toggle(row) : null"
                                    [checked]="createdSelection.isSelected(row)">
                      </mat-checkbox>
                    </td>
                  </ng-container>
                  <!-- Other columns same as templates -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.name' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ element.name || element.title }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dateCreated">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.dateCreated' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getCreatedDate(element) | date:'short' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dateModified">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.dateModified' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getModifiedDate(element) | date:'short' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.type' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="type-badge type-dashboard">
                        {{ getDashboardType(element) }}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="creator">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.creator' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getCreatorName(element) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="sections">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.sections' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getSectionCount(element) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dataSource">
                    <th mat-header-cell *matHeaderCellDef>{{ 'admin.dashboardTable.columns.dataSource' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <div class="data-source">
                        <div class="source-title">{{ getDataSourceInfo(element).title }}</div>
                        <div class="source-classes" *ngIf="getDataSourceInfo(element).classes.length > 0">
                          {{ getDataSourceInfo(element).classes.join(', ') }}
                        </div>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>{{ 'admin.dashboardTable.columns.actions' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <button mat-icon-button [matMenuTriggerFor]="actionsMenu2">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #actionsMenu2="matMenu">
                        <button mat-menu-item (click)="viewDashboard(element)">
                          <mat-icon>visibility</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.view' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="manageDashboard(element)">
                          <mat-icon>edit</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.manage' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="exportToPDF(element)">
                          <mat-icon>picture_as_pdf</mat-icon>
                          <span>{{ 'shared.export.pdf.button' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="archiveDashboard(element)">
                          <mat-icon>archive</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.archive' | translate }}</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>
              <mat-paginator #createdPaginator [pageSize]="5" [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>

          <mat-tab label="{{ 'admin.dashboardTable.tabs.archived' | translate }}">
            <div class="tab-content">
              <div class="dv-table-header">
                <h2>{{ 'admin.dashboardTable.headers.archived' | translate }}</h2>
                <div class="header-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-icon matPrefix>search</mat-icon>
                    <input matInput placeholder="{{ 'admin.dashboardTable.search_placeholder' | translate }}" (input)="onSearchInput('archived', $event)" [value]="searchValues.archived" />
                    <button mat-icon-button matSuffix *ngIf="searchValues.archived" aria-label="Clear search" (click)="clearSearch('archived')">
                      <mat-icon>close</mat-icon>
                    </button>
                  </mat-form-field>
                  <div class="bulk-actions" *ngIf="archivedSelection.hasValue()">
                    <button mat-button color="primary" (click)="restoreSelected()">
                      <mat-icon>restore</mat-icon>
                      {{ 'admin.dashboardTable.bulk.restore_selected' | translate }} ({{ archivedSelection.selected.length }})
                    </button>
                    <button mat-button color="warn" (click)="deleteSelected()">
                      <mat-icon>delete</mat-icon>
                      {{ 'admin.dashboardTable.bulk.delete_selected' | translate }} ({{ archivedSelection.selected.length }})
                    </button>
                  </div>
                </div>
              </div>
              <!-- Similar table structure for archived dashboards -->
              <div class="table-container">
                <table mat-table [dataSource]="archivedData" class="dashboard-table" matSort #archivedSort="matSort" [matSortDisableClear]="false">
                  <!-- Same columns but with different actions -->
                  <ng-container matColumnDef="select">
                    <th mat-header-cell *matHeaderCellDef>
                      <mat-checkbox (change)="$event ? masterToggle('archived') : null"
                                    [checked]="archivedSelection.hasValue() && isAllSelected('archived')"
                                    [indeterminate]="archivedSelection.hasValue() && !isAllSelected('archived')">
                      </mat-checkbox>
                    </th>
                    <td mat-cell *matCellDef="let row">
                      <mat-checkbox (click)="$event.stopPropagation()"
                                    (change)="$event ? archivedSelection.toggle(row) : null"
                                    [checked]="archivedSelection.isSelected(row)">
                      </mat-checkbox>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.name' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ element.name || element.title }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dateCreated">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.dateCreated' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getCreatedDate(element) | date:'short' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dateModified">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.dateModified' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getModifiedDate(element) | date:'short' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.type' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="type-badge type-dashboard">
                        {{ getDashboardType(element) }}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="creator">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.creator' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getCreatorName(element) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="sections">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'admin.dashboardTable.columns.sections' | translate }}</th>
                    <td mat-cell *matCellDef="let element">{{ getSectionCount(element) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dataSource">
                    <th mat-header-cell *matHeaderCellDef>{{ 'admin.dashboardTable.columns.dataSource' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <div class="data-source">
                        <div class="source-title">{{ getDataSourceInfo(element).title }}</div>
                        <div class="source-classes" *ngIf="getDataSourceInfo(element).classes.length > 0">
                          {{ getDataSourceInfo(element).classes.join(', ') }}
                        </div>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>{{ 'admin.dashboardTable.columns.actions' | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                      <button mat-icon-button [matMenuTriggerFor]="actionsMenu3">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #actionsMenu3="matMenu">
                        <button mat-menu-item (click)="viewDashboard(element)">
                          <mat-icon>visibility</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.view' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="restoreDashboard(element)">
                          <mat-icon>restore</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.restore' | translate }}</span>
                        </button>
                        <button mat-menu-item (click)="deleteDashboard(element)" color="warn">
                          <mat-icon>delete</mat-icon>
                          <span>{{ 'admin.dashboardTable.actions.delete_permanently' | translate }}</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>
              <mat-paginator #archivedPaginator [pageSize]="5" [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    /* Use Inter font like User Management for all table-related UI */
    :host, .dashboard-table, .dashboard-table th, .dashboard-table td, mat-paginator, ::ng-deep .mat-mdc-paginator,
    ::ng-deep .mat-mdc-menu-item, ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial !important;
    }

    .dashboard-table-container {
      padding: 28px;
      background: #F5F8FA; /* match admin layout main bg */
      min-height: 100vh;
    }

    .dashboard-tabs {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(17,24,39,0.04);
      overflow: hidden;
    }

    /* Tab header: use sidebar gradient */
    ::ng-deep .mat-mdc-tab-group .mat-mdc-tab-header {
      background: linear-gradient(135deg, #97cce4 0%, #306e8b 100%);
    }
    /* Remove default MDC overlays/borders that can appear as dark bars */
    ::ng-deep .mat-mdc-tab-header { box-shadow: none !important; border-bottom: none !important; }
    ::ng-deep .mat-mdc-tab-header::before,
    ::ng-deep .mat-mdc-tab-header::after { display: none !important; background: transparent !important; }
    ::ng-deep .mat-mdc-tab-header .mdc-tab-indicator .mdc-tab-indicator__content { background: transparent !important; border: none !important; }
    ::ng-deep .mat-mdc-tab-header .mat-mdc-tab .mdc-tab__ripple { background: transparent !important; }
    ::ng-deep .mat-mdc-tab-header .mat-mdc-tab .mdc-tab__content { background: transparent !important; }

    ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
      color: rgba(255,255,255,0.9) !important;
      font-weight: 700;
    }

    ::ng-deep .mat-mdc-tab-header .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: #fff !important;
      font-weight: 800;
    }

    .tab-content { padding: 24px; }

    .dv-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5eef5;
      background: transparent !important;
      box-shadow: none !important;
    }

    .dv-table-header h2 {
      margin: 0;
      color: #1f2937;
      font-size: 1.25rem;
      font-weight: 800;
      position: relative;
      z-index: 1;
    }

    .bulk-actions { display: flex; gap: 12px; }
    .bulk-actions button { border-radius: 8px; font-weight: 700; text-transform: none; }

    .header-actions { display: flex; align-items: center; gap: 12px; }
    .search-field { width: 320px; min-width: 200px; }
    .search-field .mat-form-field-wrapper { padding: 0 !important; }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(2,6,23,0.06);
      border: 1px solid #e5eef5;
    }

    .loading-container {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 20px; color: #6b7280;
    }
    .loading-container p { margin-top: 12px; font-size: 0.9rem; }

    .dashboard-table { width: 100%; border-collapse: separate; border-spacing: 0; }

    .dashboard-table th, .dashboard-table td {
      padding: 14px 20px; text-align: left; vertical-align: middle; font-weight: 400;
    }

    .dashboard-table th {
      background: linear-gradient(180deg, #ffffff, #f3f7fb);
      color: #1f2937;
      font-size: 0.75rem;
      letter-spacing: .02em;
      border-bottom: 1px solid #e5eef5;
      position: sticky; top: 0; z-index: 2;
      font-weight: 600;
    }

    .dashboard-table td { border-bottom: 1px solid #eef2f7; font-size: 0.95rem; font-weight: 400; }

    .dashboard-table .mat-mdc-row:nth-child(even), .dashboard-table .data-row:nth-child(even) { background: #f7fbff; }
    .dashboard-table tr:hover { background: #eef6fb; transition: background .15s ease; }

    .type-badge {
      padding: 6px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; color: #fff;
      background: linear-gradient(135deg, #97cce4 0%, #306e8b 100%);
    }

    .data-source { display: flex; flex-direction: column; gap: 4px; }
    .source-title { font-weight: 700; color: #111827; font-size: 0.85rem; }
    .source-classes { font-size: 0.75rem; color: #6b7280; font-weight: 600; }

    /* Menu */
    ::ng-deep .mat-mdc-menu-panel { border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    ::ng-deep .mat-mdc-menu-item { font-size: 0.95rem; padding: 10px 14px; font-weight: 700; }
    ::ng-deep .mat-mdc-menu-item mat-icon { margin-right: 10px; color: #374151; }

    /* Paginator: adopt Inter + stronger text like user management */
    mat-paginator { background: #fff; border-top: 1px solid #e5eef5; border-radius: 0 0 12px 12px; }
    ::ng-deep .mat-mdc-paginator, ::ng-deep .mat-paginator { background: transparent; }
    ::ng-deep .mat-paginator .mat-select-value-text, ::ng-deep .mat-mdc-paginator .mat-select-value-text,
    ::ng-deep .mat-paginator .mat-paginator-range-label, ::ng-deep .mat-mdc-paginator .mat-paginator-range-label {
      font-weight: 800 !important; color: #111827 !important;
    }

    /* Stronger active tab contrast */
    ::ng-deep .mat-mdc-tab-header .mat-mdc-tab { opacity: .8; transition: background .2s ease, opacity .2s ease; }
    ::ng-deep .mat-mdc-tab-header .mat-mdc-tab.mdc-tab--active {
      opacity: 1;
      background: rgba(255,255,255,0.2);
      border-bottom: 3px solid #ffffff;
      border-top-left-radius: 8px; border-top-right-radius: 8px;
    }

    /* Checkbox primary color aligned to sidebar deep blue */
    ::ng-deep .mat-mdc-checkbox .mdc-checkbox__background { border-color: #306e8b !important; }
    ::ng-deep .mat-mdc-checkbox.mat-mdc-checkbox-checked .mdc-checkbox { background-color: #306e8b !important; border-color: #306e8b !important; }

    /* Empty state */
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: .5; }
    .empty-state h3 { margin: 0 0 8px 0; color: #111827; font-weight: 800; }
    .empty-state p { margin: 0; font-size: .9rem; }
  `]
})
export class DashboardTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('templatesSort') templatesSort!: MatSort;
  @ViewChild('createdSort') createdSort!: MatSort;
  @ViewChild('archivedSort') archivedSort!: MatSort;
  @ViewChild('templatesPaginator') templatesPaginator!: MatPaginator;
  @ViewChild('createdPaginator') createdPaginator!: MatPaginator;
  @ViewChild('archivedPaginator') archivedPaginator!: MatPaginator;
  
  selectedTabIndex = 0;
  displayedColumns: string[] = ['select', 'name', 'dateCreated', 'dateModified', 'type', 'creator', 'sections', 'dataSource', 'actions'];
  isLoading = false;

  // Selection models for each tab
  templatesSelection = new SelectionModel<Dashboard>(true, []);
  createdSelection = new SelectionModel<Dashboard>(true, []);
  archivedSelection = new SelectionModel<Dashboard>(true, []);

  // Real data from backend
  allDashboards: Dashboard[] = [];
  templatesData = new MatTableDataSource<Dashboard>([]);
  createdData = new MatTableDataSource<Dashboard>([]);
  archivedData = new MatTableDataSource<Dashboard>([]);

  // Search values per tab
  searchValues: { [key in 'templates' | 'created' | 'archived']: string } = { templates: '', created: '', archived: '' };

  private createDashboardListener: any;

  constructor(
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private shareDataService: ShareDataService,
    private notifier: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboards();
    
    // Listen for create dashboard event from header button
    this.createDashboardListener = () => this.handleCreateDashboard();
    window.addEventListener('admin-create-dashboard', this.createDashboardListener);
  }

  ngOnDestroy(): void {
    // Clean up event listener
    if (this.createDashboardListener) {
      window.removeEventListener('admin-create-dashboard', this.createDashboardListener);
    }
  }

  /**
   * Handle create dashboard button click from header
   * Opens dialog, then redirects to card view with auto-scroll to new dashboard
   */
  handleCreateDashboard(): void {
    const dialogRef = this.dialog.open<
      DashboardFormDialogComponent,
      DashboardFormDialogData,
      any
    >(DashboardFormDialogComponent, {
      width: '600px',
      data: {},
      panelClass: 'modern-dialog',
      backdropClass: 'modern-backdrop',
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Ensure any stacked dialogs are closed to prevent aria-hidden/focus conflicts
      this.dialog.closeAll();
      // If dialog returned a dashboard id (string), redirect to card view with that id
      if (typeof result === 'string' && result.length > 0) {
        // Navigate to card view with the new dashboard id as query param
        this.router.navigate(['/admin/dashboard-list'], {
          queryParams: { scrollTo: result }
        });
      } else if (result === true) {
        // If just true (shouldn't happen with new flow), redirect to card view
        this.router.navigate(['/admin/dashboard-list']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.attachSorters();
    this.attachPaginators();
    this.setupFilterPredicates();
  }

  async loadDashboards(): Promise<void> {
    try {
      this.isLoading = true;
      // Get all dashboards (no server filter needed since we'll filter client-side)
      const filter = {};
      const result = await this.dashboardService.getAllDashboards(filter);
      
      if (result?.data) {
        console.log('All dashboards from server:', result.data);
        
        // Filter out job description dashboards (client-side filtering)
        this.allDashboards = result.data.filter(dashboard => 
          !dashboard.typeOfUsage || dashboard.typeOfUsage !== 'JOB_DESCRIPTION_EVALUATION'
        );
        
        console.log('Regular dashboards after filtering:', this.allDashboards.length);
        this.organizeDashboards();
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      await this.notifier.errorKey('notifications.error_loading_dashboards');
    } finally {
      this.isLoading = false;
      // Ensure sorters are attached after the view re-renders tables
      setTimeout(() => { this.attachSorters(); this.attachPaginators(); this.setupFilterPredicates(); });
    }
  }

  attachSorters(): void {
    // Set up sorting for each data source with its own MatSort instance
    if (this.templatesSort) {
      this.templatesData.sort = this.templatesSort;
      this.templatesData.sortingDataAccessor = this.customSortAccessor.bind(this);
    }
    if (this.createdSort) {
      this.createdData.sort = this.createdSort;
      this.createdData.sortingDataAccessor = this.customSortAccessor.bind(this);
    }
    if (this.archivedSort) {
      this.archivedData.sort = this.archivedSort;
      this.archivedData.sortingDataAccessor = this.customSortAccessor.bind(this);
    }
  }

  attachPaginators(): void {
    if (this.templatesPaginator) {
      this.templatesData.paginator = this.templatesPaginator;
    }
    if (this.createdPaginator) {
      this.createdData.paginator = this.createdPaginator;
    }
    if (this.archivedPaginator) {
      this.archivedData.paginator = this.archivedPaginator;
    }
  }

  setupFilterPredicates(): void {
    const predicate = this.buildFilterPredicate();
    this.templatesData.filterPredicate = predicate;
    this.createdData.filterPredicate = predicate;
    this.archivedData.filterPredicate = predicate;
  }

  buildFilterPredicate(): (data: Dashboard, filter: string) => boolean {
    return (data: Dashboard, filter: string): boolean => {
      const term = (filter || '').toLowerCase();
      if (!term) return true;
      const name = (data.name || data.title || '').toLowerCase();
      const creator = ((data.createdBy?.firstName || '') + ' ' + (data.createdBy?.lastName || '')).toLowerCase();
      const sourceTitle = (data.sources && data.sources[0]?.certification) ? (data.sources[0]!.certification as string).toLowerCase() : '';
      const sourceClasses = (data.sources && data.sources[0]?.classes || []).join(',').toLowerCase();
      const type = this.getDashboardType(data).toLowerCase();
      return (
        name.includes(term) ||
        creator.includes(term) ||
        sourceTitle.includes(term) ||
        sourceClasses.includes(term) ||
        type.includes(term)
      );
    };
  }

  onSearchInput(table: 'templates' | 'created' | 'archived', event: Event): void {
    const val = (event.target as HTMLInputElement).value || '';
    this.searchValues[table] = val;
    const ds = this.getDataSourceRef(table);
    ds.filter = val.trim().toLowerCase();
    if (ds.paginator) ds.paginator.firstPage();
  }

  clearSearch(table: 'templates' | 'created' | 'archived'): void {
    this.searchValues[table] = '';
    const ds = this.getDataSourceRef(table);
    ds.filter = '';
    if (ds.paginator) ds.paginator.firstPage();
  }

  private getDataSourceRef(table: 'templates' | 'created' | 'archived'): MatTableDataSource<Dashboard> {
    switch (table) {
      case 'templates': return this.templatesData;
      case 'created': return this.createdData;
      case 'archived': return this.archivedData;
    }
  }

  private organizeDashboards(): void {
    // Archived dashboards
    const archived = this.allDashboards.filter(d => d.isArchived === true);
    // Templates: duplicationType TEMPLATE and not archived
    const templates = this.allDashboards.filter(d => d.duplicationType === 'TEMPLATE' && !d.isArchived);
    // Created: LIVE or unspecified duplicationType and not archived
    const created = this.allDashboards.filter(d => (d.duplicationType === 'LIVE' || !d.duplicationType) && !d.isArchived);
    
    // Update data sources
    this.templatesData.data = templates;
    this.createdData.data = created;
    this.archivedData.data = archived;
    
    console.log('Dashboard organization:', {
      total: this.allDashboards.length,
      templates: templates.length,
      created: created.length,
      archived: archived.length
    });
  }

  isAllSelected(table: 'templates' | 'created' | 'archived'): boolean {
    const selection = this.getSelection(table);
    const data = this.getData(table);
    const numSelected = selection.selected.length;
    const numRows = data.length;
    return numSelected === numRows;
  }

  masterToggle(table: 'templates' | 'created' | 'archived'): void {
    const selection = this.getSelection(table);
    const data = this.getData(table);
    this.isAllSelected(table) ?
      selection.clear() :
      data.forEach(row => selection.select(row));
  }

  private getSelection(table: 'templates' | 'created' | 'archived'): SelectionModel<Dashboard> {
    switch (table) {
      case 'templates': return this.templatesSelection;
      case 'created': return this.createdSelection;
      case 'archived': return this.archivedSelection;
    }
  }

  private getData(table: 'templates' | 'created' | 'archived'): Dashboard[] {
    switch (table) {
      case 'templates': return this.templatesData.data;
      case 'created': return this.createdData.data;
      case 'archived': return this.archivedData.data;
    }
  }

  // Custom sort accessor for different column types
  customSortAccessor(data: Dashboard, sortHeaderId: string): string | number {
    switch (sortHeaderId) {
      case 'name':
        return (data.name || data.title || '').toLowerCase();
      case 'dateCreated':
        return data.createdAt ? new Date(data.createdAt).getTime() : 0;
      case 'dateModified':
        return data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
      case 'type':
        return this.getDashboardType(data).toLowerCase();
      case 'creator':
        return this.getCreatorName(data).toLowerCase();
      case 'sections':
        return this.getSectionCount(data);
      default:
        return '';
    }
  }

  // Helper methods
  getCreatedDate(dashboard: Dashboard): Date {
    return dashboard.createdAt ? new Date(dashboard.createdAt) : new Date();
  }

  getModifiedDate(dashboard: Dashboard): Date {
    return dashboard.updatedAt ? new Date(dashboard.updatedAt) : new Date();
  }

  getDashboardType(dashboard: Dashboard): string {
    // Determine type based on typeOfUsage or status
    if (dashboard.typeOfUsage === 'JOB_DESCRIPTION_EVALUATION') {
      return 'Job Description';
    }
    return 'Employability Survey';
  }

  getCreatorName(dashboard: Dashboard): string {
    if (dashboard.createdBy) {
      return `${dashboard.createdBy.lastName || ''}, ${dashboard.createdBy.firstName || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
    }
    return 'Unknown';
  }

  getSectionCount(dashboard: Dashboard): number {
    return dashboard.sectionIds?.length || 0;
  }

  getDataSourceInfo(dashboard: Dashboard): { title: string; classes: string[] } {
    if (dashboard.sources && dashboard.sources.length > 0) {
      const firstSource = dashboard.sources[0];
      return {
        title: firstSource.certification || 'No source',
        classes: firstSource.classes || []
      };
    }
    return { title: 'No source', classes: [] };
  }

  // Action methods
  viewDashboard(dashboard: Dashboard): void {
    if (dashboard._id) {
      this.shareDataService.setDashboardId(dashboard._id);
      this.router.navigate(['/dashboard']);
    }
  }

  manageDashboard(dashboard: Dashboard): void {
    if (dashboard._id) {
      this.router.navigate(['/admin/dashboard-builder', dashboard._id]);
    }
  }

  exportToPDF(dashboard: Dashboard): void {
    // TODO: Implement PDF export functionality
    this.notifier.infoKey('notifications.feature_coming_soon');
  }

  async archiveDashboard(dashboard: Dashboard): Promise<void> {
    if (!dashboard._id) return;
    
    const confirmation = await this.notifier.confirmKey(
      'notifications.confirm_archive_dashboard',
      { title: dashboard.title },
      { showCancelButton: true, confirmButtonColor: '#f57c00' }
    );

    if (confirmation.isConfirmed) {
      try {
        this.isLoading = true;
        const sourcesInput = (dashboard.sources || []).map(s => ({ certification: s?.certification ?? '', classes: s?.classes ?? [] }));
        await this.dashboardService.updateDashboard(dashboard._id, { isArchived: true, sources: sourcesInput });
        await this.notifier.successKey('notifications.dashboard_archived');
        this.loadDashboards(); // Refresh data
      } catch (error) {
        console.error('Error archiving dashboard:', error);
        await this.notifier.errorKey('notifications.archive_failed');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async deleteDashboard(dashboard: Dashboard): Promise<void> {
    if (!dashboard._id) return;
    
    const confirmation = await this.notifier.confirmKey(
      'notifications.confirm_delete_dashboard',
      { title: dashboard.title },
      { showCancelButton: true, confirmButtonColor: '#d33' }
    );

    if (confirmation.isConfirmed) {
      try {
        this.isLoading = true;
        await this.dashboardService.deleteDashboard(dashboard._id);
        await this.notifier.successKey('notifications.deleted');
        this.loadDashboards();
      } catch (error) {
        console.error('Error deleting dashboard:', error);
        await this.notifier.errorKey('notifications.delete_failed');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async restoreDashboard(dashboard: Dashboard): Promise<void> {
    if (!dashboard._id) return;
    
    try {
      this.isLoading = true;
      const sourcesInput = (dashboard.sources || []).map(s => ({ certification: s?.certification ?? '', classes: s?.classes ?? [] }));
      await this.dashboardService.updateDashboard(dashboard._id, { isArchived: false, sources: sourcesInput });
      await this.notifier.successKey('notifications.dashboard_restored');
      this.loadDashboards(); // Refresh data
    } catch (error) {
      console.error('Error restoring dashboard:', error);
      await this.notifier.errorKey('notifications.restore_failed');
    } finally {
      this.isLoading = false;
    }
  }

  async archiveSelected(table: 'templates' | 'created'): Promise<void> {
    const selection = this.getSelection(table);
    if (!selection.hasValue()) return;

    const confirmation = await this.notifier.confirmKey(
      'notifications.confirm_bulk_archive',
      { count: selection.selected.length.toString() },
      { showCancelButton: true, confirmButtonColor: '#f57c00' }
    );

    if (confirmation.isConfirmed) {
      try {
        this.isLoading = true;
        const promises = selection.selected.map(dashboard => {
          const sourcesInput = (dashboard.sources || []).map(s => ({ certification: s?.certification ?? '', classes: s?.classes ?? [] }));
          return this.dashboardService.updateDashboard(dashboard._id!, { isArchived: true, sources: sourcesInput });
        });
        await Promise.all(promises);
        await this.notifier.successKey('notifications.bulk_archived');
        selection.clear();
        this.loadDashboards();
      } catch (error) {
        console.error('Error archiving dashboards:', error);
        await this.notifier.errorKey('notifications.bulk_archive_failed');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async restoreSelected(): Promise<void> {
    const selection = this.archivedSelection;
    if (!selection.hasValue()) return;

    const confirmation = await this.notifier.confirmKey(
      'notifications.confirm_bulk_restore',
      { count: selection.selected.length.toString() },
      { showCancelButton: true, confirmButtonColor: '#2196f3' }
    );

    if (confirmation.isConfirmed) {
      try {
        this.isLoading = true;
        const promises = selection.selected.map(dashboard => {
          const sourcesInput = (dashboard.sources || []).map(s => ({ certification: s?.certification ?? '', classes: s?.classes ?? [] }));
          return this.dashboardService.updateDashboard(dashboard._id!, { isArchived: false, sources: sourcesInput });
        });
        await Promise.all(promises);
        await this.notifier.successKey('notifications.bulk_restored');
        selection.clear();
        this.loadDashboards();
      } catch (error) {
        console.error('Error restoring dashboards:', error);
        await this.notifier.errorKey('notifications.bulk_restore_failed');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async deleteSelected(): Promise<void> {
    const selection = this.archivedSelection;
    if (!selection.hasValue()) return;

    const confirmation = await this.notifier.confirmKey(
      'notifications.confirm_bulk_delete',
      { count: selection.selected.length.toString() },
      { showCancelButton: true, confirmButtonColor: '#d33' }
    );

    if (confirmation.isConfirmed) {
      try {
        this.isLoading = true;
        const promises = selection.selected.map(dashboard => 
          this.dashboardService.deleteDashboard(dashboard._id!)
        );
        await Promise.all(promises);
        await this.notifier.successKey('notifications.bulk_deleted');
        selection.clear();
        this.loadDashboards();
      } catch (error) {
        console.error('Error deleting dashboards:', error);
        await this.notifier.errorKey('notifications.bulk_delete_failed');
      } finally {
        this.isLoading = false;
      }
    }
  }

  /**
   * Navigate to card view (dashboard-list page)
   */
  navigateToCardView(): void {
    this.router.navigate(['/admin/dashboard-list']);
  }
}
