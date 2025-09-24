import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardBuilderService } from '../dashboard-builder/dashboard-builder.service';
import { MatDialog } from '@angular/material/dialog';
import { DashboardFormDialogComponent, DashboardFormDialogData } from '../../components/dashboard-form-dialog/dashboard-form-dialog.component';
import { ShareDataService } from 'app/shared/services/share-data.service';
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';

interface Section {
  _id?: string;
  title: string;
}

interface SourceEntry {
  certification: string | null;
  classes: string[] | null;
}

interface CreatorUser {
  firstName?: string;
  lastName?: string;
}

interface DashboardRow {
  _id?: string;
  name?: string;
  title: string;
  sectionIds?: Section[];
  sources?: SourceEntry[];
  type?: 'TEMPLATE' | 'LIVE' | string;
  isArchived?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: CreatorUser;
}

@Component({
  selector: 'app-dashboard-table',
  standalone: true,
  imports: [
    CommonModule,
    AdminLayoutComponent,
    MatTabsModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DatePipe,
    TranslatePipe,
  ],
  templateUrl: './dashboard-table.component.html',
  styleUrl: './dashboard-table.component.scss'
})
export class DashboardTableComponent implements OnInit, OnDestroy {
  category: 'eval-pro' | 'job-desc' = 'eval-pro';
  isForJobDescription = false;

  tabs: Array<'templates' | 'live' | 'archived'> = ['templates', 'live', 'archived'];
  activeTabIndex = 1; // default to "Dashboard Created"

  isLoading = false;
  rows: DashboardRow[] = [];

  // selections
  selectedMap: Map<string, boolean> = new Map();
  masterSelected = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardBuilderService,
    private dialog: MatDialog,
    private shareDataService: ShareDataService,
    private notifier: NotificationService,
  ) {}

  ngOnInit(): void {
    // read route param
    this.route.paramMap.subscribe(params => {
      const cat = (params.get('category') || 'eval-pro') as 'eval-pro' | 'job-desc';
      this.category = cat;
      this.isForJobDescription = cat === 'job-desc';
      // keep current tab index, just reload
      this.loadCurrentTab();
    });

    // read optional query tab
    const tabFromQuery = this.route.snapshot.queryParamMap.get('tab');
    if (tabFromQuery) {
      const idx = this.tabs.indexOf(tabFromQuery as any);
      if (idx >= 0) this.activeTabIndex = idx;
    }

    this.loadCurrentTab();
  }

  ngOnDestroy(): void {}

  onTabChange(index: number): void {
    this.activeTabIndex = index;
    this.loadCurrentTab();
  }

  private getFilterForActiveTab(): any {
    const current = this.tabs[this.activeTabIndex];
    if (current === 'templates') {
      return { type: 'TEMPLATE', isForJobDescription: this.isForJobDescription };
    }
    if (current === 'live') {
      return { type: 'LIVE', isForJobDescription: this.isForJobDescription };
    }
    // archived
    return { isArchived: true, isForJobDescription: this.isForJobDescription };
  }

  async loadCurrentTab(): Promise<void> {
    try {
      this.isLoading = true;
      const filter = this.getFilterForActiveTab();
      const result = await this.dashboardService.getAllDashboards(filter);
      this.rows = (result?.data || []) as DashboardRow[];
      // reset selection map
      this.selectedMap.clear();
      this.masterSelected = false;
    } catch (err) {
      console.error('Failed to load dashboards for table', err);
    } finally {
      this.isLoading = false;
    }
  }

  // selection helpers
  isRowSelected(row: DashboardRow): boolean {
    if (!row._id) return false;
    return this.selectedMap.get(row._id) || false;
  }

  toggleRowSelection(row: DashboardRow, checked: boolean): void {
    if (!row._id) return;
    this.selectedMap.set(row._id, checked);
    this.updateMasterSelection();
  }

  toggleMasterSelection(checked: boolean): void {
    this.masterSelected = checked;
    for (const r of this.rows) {
      if (r._id) this.selectedMap.set(r._id, checked);
    }
  }

  private updateMasterSelection(): void {
    const total = this.rows.filter(r => !!r._id).length;
    const selected = this.rows.filter(r => r._id && (this.selectedMap.get(r._id) || false)).length;
    this.masterSelected = total > 0 && selected === total;
  }

  selectedIds(): string[] {
    return this.rows.filter(r => r._id && (this.selectedMap.get(r._id) || false)).map(r => r._id!)
  }

  // actions
  async archiveSelected(): Promise<void> {
    const ids = this.selectedIds();
    if (ids.length === 0) return;

    const confirm = await this.notifier.confirmKey('notifications.confirm_archive_selected', { count: ids.length });
    if (!confirm.isConfirmed) return;

    try {
      this.isLoading = true;
      await Promise.all(ids.map(id => this.dashboardService.updateDashboard(id, { isArchived: true })));
      await this.notifier.successKey('notifications.archived_success');
      this.loadCurrentTab();
    } catch (e) {
      console.error('Archive selected error', e);
      await this.notifier.errorKey('notifications.error_generic');
    } finally {
      this.isLoading = false;
    }
  }

  sectionsCount(row: DashboardRow): number {
    return row.sectionIds?.length || 0;
  }

  typeLabel(): string {
    // Column Type shows domain type based on current category
    return this.isForJobDescription ? 'Job Desc' : 'Eval Pro';
  }

  creatorName(row: DashboardRow): string {
    const fn = row.createdBy?.firstName || '';
    const ln = row.createdBy?.lastName || '';
    const name = `${fn} ${ln}`.trim();
    return name || '-';
  }

  dataSourcesText(row: DashboardRow): string {
    if (!row.sources || row.sources.length === 0) return '-';
    try {
      return row.sources.map(s => {
        const title = s.certification || '';
        const classes = (s.classes || []).join(', ');
        if (title && classes) return `${title}: ${classes}`;
        if (title) return title;
        if (classes) return classes;
        return '';
      }).filter(Boolean).join(' • ');
    } catch {
      return '-';
    }
  }

  openDashboard(row: DashboardRow): void {
    if (!row._id) return;
    this.shareDataService.setDashboardId(row._id);
    this.router.navigate(['/dashboard']);
  }

  manageDashboard(row: DashboardRow): void {
    if (!row._id) return;
    this.router.navigate(['/admin/dashboard-builder', row._id]);
  }

  async exportPDF(row: DashboardRow): Promise<void> {
    // Placeholder pending backend confirmation for full dashboard PDF
    await this.notifier.infoKey('shared.export.pdf.preparing_title');
    // TODO: Integrate dashboard-level PDF export when backend endpoint/spec is provided
  }

  async archiveDashboard(row: DashboardRow): Promise<void> {
    if (!row._id) return;
    const confirm = await this.notifier.confirmKey('notifications.confirm_archive_dashboard', { title: row.title });
    if (!confirm.isConfirmed) return;
    try {
      await this.dashboardService.updateDashboard(row._id, { isArchived: true });
      await this.notifier.successKey('notifications.archived_success');
      this.loadCurrentTab();
    } catch (e) {
      console.error('Archive dashboard error', e);
      await this.notifier.errorKey('notifications.error_generic');
    }
  }

  createNewDashboard(): void {
    const dialogRef = this.dialog.open<DashboardFormDialogComponent, DashboardFormDialogData, any>(
      DashboardFormDialogComponent,
      {
        width: '600px',
        data: {},
        panelClass: 'modern-dialog',
        backdropClass: 'modern-backdrop',
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (typeof result === 'string' && result.length > 0) {
        this.loadCurrentTab().then(() => {
          // navigate to manage or view newly created depending on preference
        });
      } else if (result === true) {
        this.loadCurrentTab();
      }
    });
  }
}
