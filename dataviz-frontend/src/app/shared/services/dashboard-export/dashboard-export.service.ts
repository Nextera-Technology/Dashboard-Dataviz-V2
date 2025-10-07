import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardBuilderRepository } from '@dataviz/repositories/dashboard-builder/dashboard-builder.repository';
import { ExportCaptureService } from '../export-capture/export-capture.service';
import { TranslationService } from '../translation/translation.service';
import { ShareDataService } from 'app/shared/services/share-data.service';

export interface WidgetExportPayload {
  widgetId: string;
  displayChartFilename: string | null;
  lineChartFilename: string | null;
}

export interface DashboardExportPayload {
  dashboardId: string;
  exportType: string; // 'PDF'
  lang: string;       // 'EN' | 'FR'
  widgets: WidgetExportPayload[];
}

/**
 * Service for orchestrating dashboard PDF export
 * Collects all widgets, captures images, and builds export payload
 */
@Injectable({ providedIn: 'root' })
export class DashboardExportService {
  private dashboardRepo = inject(DashboardBuilderRepository);
  private captureService = inject(ExportCaptureService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private shareData = inject(ShareDataService);

  constructor() {}

  /**
   * Collect dashboard export payload by capturing all widgets
   * @param dashboardId - Dashboard ID to export
   * @param progressCallback - Optional callback for progress updates (current, total)
   * @returns Complete export payload ready for backend
   */
  async collectDashboardExportPayload(
    dashboardId: string,
    progressCallback?: (current: number, total: number) => void
  ): Promise<DashboardExportPayload> {
    // 1) Query dashboard structure
    const dashboard = await this.dashboardRepo.getOneDashboard(dashboardId);
    if (!dashboard || !Array.isArray(dashboard.sectionIds)) {
      throw new Error('Dashboard not found or has no sections');
    }

    const allWidgets: any[] = [];
    for (const section of dashboard.sectionIds) {
      if (section?.widgetIds && Array.isArray(section.widgetIds)) {
        // Only include visible widgets (matching section.component.ts filter)
        const visibleWidgets = section.widgetIds.filter((w: any) => w && w.visible !== false);
        allWidgets.push(...visibleWidgets);
      }
    }
    if (!allWidgets.length) throw new Error('No widgets found in dashboard');

    // 2) Ensure dashboard view is showing the intended dashboard
    this.shareData.setDashboardId(dashboardId);
    
    // Always navigate to force reload, even if already on /dashboard route
    await this.router.navigate(['/dashboard'], { 
      queryParams: { _export: Date.now() }, // Force reload with timestamp
      queryParamsHandling: 'merge' 
    });
    
    await this.waitForDashboardLoaded(dashboardId, 10000);
    await this.waitForWidgetsToRender(allWidgets, 15000);

    // 3) Capture images per widget
    const widgetPayloads: WidgetExportPayload[] = [];
    const total = allWidgets.length;
    for (let i = 0; i < total; i++) {
      const w = allWidgets[i];
      const widgetId = w?._id || w?.id;
      if (!widgetId) continue;

      if (progressCallback) progressCallback(i + 1, total);

      try {
        const { displayChartS3Key, lineChartS3Key } = await this.captureService.captureWidgetImages(widgetId, w);
        widgetPayloads.push({
          widgetId,
          displayChartFilename: displayChartS3Key,
          lineChartFilename: lineChartS3Key,
        });
      } catch (err) {
        console.warn('Capture failed for widget', widgetId, err);
        widgetPayloads.push({ widgetId, displayChartFilename: null, lineChartFilename: null });
      }

      await this.delay(120);
    }

    // 4) Build payload - filter out widgets with no images to avoid BE merge errors
    const lang = this.translationService.getCurrentLanguage().toUpperCase() === 'FR' ? 'FR' : 'EN';
    const filtered = widgetPayloads.filter(w => !!(w.displayChartFilename || w.lineChartFilename));
    
    if (filtered.length === 0) {
      throw new Error('No capturable widgets found - all captures returned null');
    }

    return {
      dashboardId,
      exportType: 'PDF',
      lang,
      widgets: filtered,
    };
  }

  /**
   * Export dashboard to PDF (full flow)
   * @param dashboardId - Dashboard ID to export
   * @param progressCallback - Optional progress callback
   * @returns Download URL or filename
   */
  async exportDashboardPDF(
    dashboardId: string,
    progressCallback?: (current: number, total: number) => void
  ): Promise<string> {
    const payload = await this.collectDashboardExportPayload(dashboardId, progressCallback);
    const res = await this.dashboardRepo.exportDashboardData(payload);
    if (!res?.filename) throw new Error('No filename returned from backend');
    return res.filename;
  }

  /**
   * Wait for DashboardComponent to load intended dashboard
   */
  private async waitForDashboardLoaded(expectedId: string, timeoutMs = 10000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const loaded = this.shareData.getLoadedDashboardId();
      if (loaded === expectedId) return;
      await this.delay(100);
    }
    console.warn('Timeout waiting for dashboard to load; continuing');
  }

  /**
   * Wait until most widgets exist in DOM
   */
  private async waitForWidgetsToRender(widgets: any[], timeoutMs = 10000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      let rendered = 0;
      for (const w of widgets) {
        const id = w?._id || w?.id;
        // Primary: check wrapper added in section.component.ts
        const wrapper = document.getElementById(`chart-div-${id}`);
        if (wrapper) {
          rendered++;
        } else {
          // Fallback: check legacy specific chart IDs
          const ids = [
            `pie-chart-div-${id}`,
            `bar-chart-div-${id}`,
            `line-chart-div-${id}`,
            `column-chart-div-${id}`,
            `sankey-chart-div-${id}`,
            `map-div-${id}`,
            `map-chart-div-${id}`,
            `widget-chart-${id}`,
          ];
          if (ids.some(x => !!document.getElementById(x))) rendered++;
        }
      }
      if (rendered >= Math.max(1, Math.floor(widgets.length * 0.8))) {
        await this.delay(700);
        return;
      }
      await this.delay(200);
    }
    console.warn('Timeout waiting for widgets render; continuing');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
