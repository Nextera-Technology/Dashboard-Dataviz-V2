import { Component, Input, OnInit, TemplateRef, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScopeDialogComponent } from '../action-dialogs/scope-dialog/scope-dialog.component';
import { InformationDialogComponent } from '../action-dialogs/information-dialog/information-dialog.component';
import { ShareDataService } from 'app/shared/services/share-data.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { RepositoryFactory } from '@dataviz/repositories/repository.factory';
import { DashboardBuilderRepository } from '@dataviz/repositories/dashboard-builder/dashboard-builder.repository';
import { environment } from 'environments/environment';
import { DatavizPlatformService } from '@dataviz/services/platform/platform.service';
import { TranslationService } from 'app/shared/services/translation/translation.service';
import { SessionMonitorService } from 'app/core/auth/session-monitor.service';
import { PdfExportStateService } from 'app/shared/services/pdf-export-state.service';
import Swal from 'sweetalert2';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';
import { Apollo, gql } from 'apollo-angular';
// Import html-to-image library - install with: npm install --save html-to-image
// @ts-ignore
import { toPng, toBlob } from 'html-to-image';

@Component({
  selector: 'app-actions-buttons',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './actions-buttons.component.html',
  styleUrl: './actions-buttons.component.scss'
})
export class ActionsButtonsComponent implements OnInit {

  @Input() isDashboard: boolean;
  @Input() widget: any;
  description : string = "This is a sample description for the widget. It provides an overview of the data and insights available in this widget.";

  exportMenuOpen = false;
  exportLoading = false;
  private dashboardRepo: DashboardBuilderRepository;
  private platform = inject(DatavizPlatformService);
  private translationService = inject(TranslationService);
  private sessionMonitor = inject(SessionMonitorService);
  private pdfExportState = inject(PdfExportStateService);

  scopedata = [
    { name: 'Insertion rapide dans l’emploi', detail: 'majorité en emploi dès l’ES2 (105 à l’ES2, stable à 95 pour les ES3/ES4).' },
    { name: 'Service Tax', detail: 'Forte baisse de la recherche d’emploi : de 140 à l’ES1 à seulement 4 à l’ES4.' },
    { name: 'VAT', detail: 'Poursuite d’études très faible : entre 4 et 5 étudiants concernés par vague.' },
    { name: 'Federal Tax', detail: 'Inactivité marginale : très peu de cas (maximum 5 à l’ES2).' },
    { name: 'Import Duty', detail: 'Stabilité des réponses : légère hausse des non-réponses, mais données globalement fiables.' }
  ];
  constructor(private dialog: MatDialog, private shareDataService: ShareDataService, private hostEl: ElementRef, private apollo: Apollo) { 
    this.dashboardRepo = RepositoryFactory.createRepository('dashboard-builder') as DashboardBuilderRepository;
  }

  ngOnInit(): void {
    this.isDashboard = this.shareDataService.getIsDashboard();
  }
  paragraphClicked(dialogType: string) {
   const dialogRef = this.dialog.open(InformationDialogComponent, {
      width: '70%',
      data: { widget: this.widget },
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'centered-dialog'
    });
      
  }
 
  scopeClicked(info: string): void {
    const dialogRef = this.dialog.open(ScopeDialogComponent, {
      width: '70%',
      data: { widget: this.widget },
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'centered-dialog'
    });

    dialogRef.afterClosed().subscribe(() => {
      // Dialog is closed, you can perform additional actions here if needed
    });
  }

   excelClicked(info:string): void {
    // Excel export functionality
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

  toggleExportMenu(event: MouseEvent): void {
    event.preventDefault();
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  closeMenusOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-wrapper')) {
      this.exportMenuOpen = false;
    }
  }

  async onExport(type: 'csv' | 'json' | 'excel' | 'pdf') {
    try {
      this.exportMenuOpen = false;
      
      // Handle PDF export differently
      if (type === 'pdf') {
        await this.exportPDF();
        return;
      }
      
      // Original export logic for CSV, JSON, Excel
      this.exportLoading = true;
      const widgetId = this.widget?._id || this.widget?.id;
      if (!widgetId) {
        console.error('Widget id not found');
        this.exportLoading = false;
        return;
      }
      const mapping: Record<string, string> = { csv: 'CSV', json: 'JSON', excel: 'EXCEL' };
      const apiType = mapping[type] ?? 'CSV';
      const res = await this.dashboardRepo.exportWidgetData(widgetId, apiType);
      const filename: string = res?.filename;
      if (!filename) {
        console.error('Filename not returned from API');
        this.exportLoading = false;
        return;
      }

      const base = environment.fileUrl || '';
      let url = filename.startsWith('http') ? filename : `${base}${filename}`;
      // Add download=true for Mac/Safari as requested
      const needsDownloadParam = this.platform.isIOS || this.platform.isSafari || this.platform.isMac;
      if (needsDownloadParam) {
        url += (url.includes('?') ? '&' : '?') + 'download=true';
      }

      // Trigger download
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = '';
      anchor.target = '_blank';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      this.exportLoading = false;
    } catch (e) {
      console.error('Export failed', e);
      this.exportLoading = false;
    }
  }

  /**
   * Export widget to PDF with chart image
   */
  async exportPDF() {
    try {
      const widgetId = this.widget?._id || this.widget?.id;
      if (!widgetId) {
        console.error('Widget id not found');
        return;
      }

      // === Check if another PDF export is already in progress ===
      if (this.pdfExportState.isExporting) {
        const currentWidget = this.pdfExportState.currentWidgetTitle || this.pdfExportState.currentWidgetId || 'another widget';
        await Swal.fire({
          icon: 'warning',
          title: this.translationService.translate('shared.export.pdf.already_processing_title'),
          html: this.translationService.translate('shared.export.pdf.already_processing_message')
            .replace('{{widget}}', currentWidget),
          confirmButtonText: 'OK'
        });
        return;
      }
      // === END EXPORT CHECK ===

      // === SESSION CHECK GUARD ===
      // Check if session has enough time for PDF export (long-running operation)
      const sessionCheck = this.sessionMonitor.checkBeforeExport();
      
      if (!sessionCheck.canProceed) {
        if (sessionCheck.message === 'session_expired') {
          // Session already expired - block and redirect
          await Swal.fire({
            icon: 'warning',
            title: this.translationService.translate('session.expired_title'),
            text: this.translationService.translate('session.expired_export_message'),
            confirmButtonText: 'OK',
            allowOutsideClick: false
          });
          // Trigger logout
          try {
            const win = window as any;
            if (win?.appLogout) win.appLogout();
          } catch {}
          window.location.replace('/auth/login');
          return;
        }
        
        if (sessionCheck.message === 'session_insufficient') {
          // Session will likely expire during export - warn and ask confirmation
          const remainingTime = this.sessionMonitor.formatRemainingTime(sessionCheck.remainingMs);
          const result = await Swal.fire({
            icon: 'warning',
            title: this.translationService.translate('session.insufficient_title'),
            html: this.translationService.translate('session.insufficient_export_message')
              .replace('{{time}}', remainingTime),
            showCancelButton: true,
            confirmButtonText: this.translationService.translate('session.continue_anyway'),
            cancelButtonText: this.translationService.translate('session.cancel_export'),
            confirmButtonColor: '#f59e0b',
            reverseButtons: true
          });
          
          if (!result.isConfirmed) {
            return; // User chose to cancel
          }
          // User chose to continue anyway - proceed with export
        }
      }
      // === END SESSION CHECK GUARD ===

      // === Track global PDF export state ===
      const widgetTitle = this.widget?.title || this.widget?.name || `Widget ${widgetId}`;
      this.pdfExportState.startExport(widgetId, widgetTitle);
      // === END TRACKING ===

      this.exportLoading = true;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: this.translationService.translate('shared.export.pdf.preparing_title'),
        html: `
          <div style="display:flex;align-items:center;margin-top:8px;">
            <div style="position:relative;width:22px;height:22px;margin-right:8px;">
              <div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(0,0,0,0.12);"></div>
              <div style="position:absolute;inset:0;border-radius:50%;border:2px solid #3b82f6;border-top-color:transparent;animation:swalSpin 0.9s linear infinite;"></div>
            </div>
            <div style="font-size:13px;opacity:0.85;">Processing PDF...</div>
          </div>
          <style>@keyframes swalSpin{to{transform:rotate(360deg)}}</style>
        `,
        allowOutsideClick: true,
        allowEscapeKey: true,
        showConfirmButton: false
      });
      
      try {
        // 1) Export chart image from widget (displayChart)
        let displayChartS3Key: string | undefined;
        
        // Find chart container in widget
        const chartContainer = this.findChartContainer();
        if (chartContainer) {
          // Check if this is a metric/card widget (non-amCharts)
          const isMetricWidget = this.widget?.chartType === 'CARD' || 
                                this.widget?.widgetType === 'metric' ||
                                this.widget?.type === 'metric';
          // Prefer DOM capture for world map widget to include legend and labels
          const mapCard = chartContainer.closest('.map-card');
          const isWorldMap = !!mapCard || ['STUDENT_REGION_DISTRIBUTION','REGION_SALARY_AVERAGE'].includes(String(this.widget?.widgetSubType || ''));
          
          if (isMetricWidget || isWorldMap) {
            // Use html-to-image for metric/card widgets
            try {
              const elementToCapture = isWorldMap && mapCard instanceof HTMLElement ? mapCard : chartContainer;
              displayChartS3Key = await this.exportDomElementToPNG(elementToCapture);
              
              // If html-to-image failed, try fallback method
              if (!displayChartS3Key) {
                const fallbackFile = await this.exportChartElementFallback(elementToCapture);
                if (fallbackFile) {
                  const uploadResult = await this.dashboardRepo.uploadPublicAsset(fallbackFile, 'IMAGE');
                  displayChartS3Key = uploadResult?.s3Key;
                }
              }
            } catch (err) {
              console.error('Failed to export metric widget:', err);
              // Try fallback method as last resort
              try {
                const elementToCapture = isWorldMap && mapCard instanceof HTMLElement ? mapCard : chartContainer;
                const fallbackFile = await this.exportChartElementFallback(elementToCapture);
                if (fallbackFile) {
                  const uploadResult = await this.dashboardRepo.uploadPublicAsset(fallbackFile, 'IMAGE');
                  displayChartS3Key = uploadResult?.s3Key;
                }
              } catch (fallbackErr) {
                console.error('All export methods failed:', fallbackErr);
                displayChartS3Key = undefined;
              }
            }
          } else {
            // Try to get amCharts Root instance for chart widgets
            const root = this.getChartRoot(chartContainer);
            if (root) {
              // Export chart to PNG -> upload -> get s3Key
              try {
                displayChartS3Key = await this.exportChartToPNG(root);
              } catch (err) {
                displayChartS3Key = undefined;
              }
            }

            // Fallback: if export failed or returned nothing, try exporting from DOM (canvas/SVG)
            if (!displayChartS3Key) {
              try {
                const fallbackFile = await this.exportChartElementFallback(chartContainer);
                if (fallbackFile) {
                  const uploadResult = await this.dashboardRepo.uploadPublicAsset(fallbackFile, 'IMAGE');
                  displayChartS3Key = uploadResult?.s3Key;
                }
              } catch (err) {
                // Fallback export failed, try html-to-image as final fallback
                try {
                  displayChartS3Key = await this.exportDomElementToPNG(chartContainer);
                } catch (htmlToImageErr) {
                  console.warn('All export methods failed:', htmlToImageErr);
                }
              }
            }
          }
        }

        // If still not found, try locating any amCharts root near this action buttons host
        if (!displayChartS3Key) {
          try {
            const roots = (am5.registry && (am5.registry as any).rootElements) || [];
            const nearestContainer = this.hostEl?.nativeElement?.closest?.('.chart-box') || this.hostEl?.nativeElement?.parentElement;
            let foundRoot: any = null;
            for (let i = 0; i < roots.length; i++) {
              const r = roots[i] || (roots.getIndex ? roots.getIndex(i) : null);
              if (r?.dom && nearestContainer && nearestContainer.contains(r.dom)) {
                foundRoot = r;
                break;
              }
            }
            if (!foundRoot && roots.length === 1) foundRoot = roots[0];
            if (foundRoot) {
              try {
                displayChartS3Key = await this.exportChartToPNG(foundRoot);
              } catch (err) {
                // Root export failed, try fallback
              }

              if (!displayChartS3Key && foundRoot?.dom instanceof HTMLElement) {
                try {
                  const fallbackFile2 = await this.exportChartElementFallback(foundRoot.dom as HTMLElement);
                  if (fallbackFile2) {
                    const uploadRes2 = await this.dashboardRepo.uploadPublicAsset(fallbackFile2, 'IMAGE');
                    displayChartS3Key = uploadRes2?.s3Key;
                  }
                } catch (err) {
                  // Fallback failed, continue without display chart
                }
              }
            }
          } catch (err) {
            // Root discovery failed, continue without display chart
          }
        }

        // 2) Generate lineChart (information) image offscreen and upload to get s3Key
        const lineChartS3Key = await this.generateInformationChartS3Key(widgetId);

        // 3) Call export widget data with PDF type
        const res = await this.dashboardRepo.exportWidgetData(
          widgetId, 
          'PDF',
          displayChartS3Key || null,
          lineChartS3Key || null
        );
        
        const filename: string = res?.filename;
        if (!filename) {
          throw new Error('Filename not returned from API');
        }

        // Download PDF file
        const base = environment.fileUrl || '';
        let url = filename.startsWith('http') ? filename : `${base}${filename}`;
        
        // Add download param for Safari/Mac
        const needsDownloadParam = this.platform.isIOS || this.platform.isSafari || this.platform.isMac;
        if (needsDownloadParam) {
          url += (url.includes('?') ? '&' : '?') + 'download=true';
        }

        // Trigger download
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `widget-${widgetId}.pdf`;
        anchor.target = '_blank';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        Swal.close();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: this.translationService.translate('shared.export.pdf.success_title'),
          showConfirmButton: false,
          timer: 2000
        });
        
      } catch (error) {
        Swal.close();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: this.translationService.translate('shared.export.pdf.error_title'),
          showConfirmButton: false,
          timer: 2500
        });
      } finally {
        this.exportLoading = false;
        this.pdfExportState.endExport(); // End global export tracking
      }
      
    } catch (e) {
      this.exportLoading = false;
      this.pdfExportState.endExport(); // End global export tracking
      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: this.translationService.translate('shared.export.pdf.error_title'),
        showConfirmButton: false,
        timer: 2500
      });
    }
  }

  /**
   * Find chart container element in widget
   */
  private findChartContainer(): HTMLElement | null {
    const widgetId = this.widget?._id || this.widget?.id;
    if (!widgetId) return null;
    
    // Check if this is a metric/card widget first
    const metricContainer = this.findMetricWidgetContainer();
    if (metricContainer) {
      return metricContainer;
    }
    
    // Try to find chart container by common patterns
    const possibleIds = [
      `pie-chart-div-${widgetId}`,
      `bar-chart-div-${widgetId}`,
      `line-chart-div-${widgetId}`,
      `column-chart-div-${widgetId}`,
      `sankey-chart-div-${widgetId}`,
      `map-div-${widgetId}`,
      // Map widget uses this id pattern in template
      `map-chart-div-${widgetId}`,
      // WorldMapWidget (region maps) patterns
      `students-map-chart-div-${widgetId}`,
      `salary-map-chart-div-${widgetId}`,
      `chart-div-${widgetId}`,
      `widget-chart-${widgetId}`
    ];
    
    // For WorldMapWidget (region maps), also try to find by classes
    const worldMapContainers = Array.from(document.querySelectorAll('.map-chart-container'));
    for (const container of worldMapContainers) {
      if (container instanceof HTMLElement) {
        // Check if this container is within the same widget by looking for parent with widget data
        const widgetContainer = container.closest('[data-widget-id]') || 
                               container.closest('.france-regional-maps-container');
        if (widgetContainer) {
          // Try to match widget context - look for actions-buttons with same widget
          const actionsInSameWidget = widgetContainer.querySelector('app-actions-buttons');
          if (actionsInSameWidget === this.hostEl?.nativeElement?.closest('app-actions-buttons')) {
            return container;
          }
        }
      }
    }
    
    for (const id of possibleIds) {
      const element = document.getElementById(id);
      if (element) {
        return element;
      }
    }
    
    // Try to find by class
    const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (widgetElement) {
      const chartEl = widgetElement.querySelector('.chart-container') || 
                      widgetElement.querySelector('[class*="chart-div"]');
      if (chartEl instanceof HTMLElement) {
        return chartEl;
      }
    }
    
    // Fallback: search relative to the action buttons host element in the DOM tree
    try {
      const host: HTMLElement = this.hostEl?.nativeElement;
      // climb up to a reasonable container (chart-box or widget container)
      const nearestContainer = host.closest('.chart-box') || host.closest('[data-widget-id]') || host.parentElement;
      if (nearestContainer) {
        const candidate = nearestContainer.querySelector('.chart-container') ||
                          nearestContainer.querySelector('[id*="chart-div"]') ||
                          nearestContainer.querySelector('svg').parentElement as HTMLElement | null;
        if (candidate instanceof HTMLElement) {
          return candidate;
        }
      }
    } catch {}
    
    
    return null;
  }

  /**
   * Get amCharts Root instance from container
   */
  private getChartRoot(container: HTMLElement): am5.Root | null {
    // amCharts stores root instance in container's data
    const anyContainer = container as any;
    if (anyContainer._amRoot) {
      return anyContainer._amRoot;
    }
    
    // Try alternative method using amCharts registry
    const roots = am5.registry.rootElements as any;
    if (roots && roots.length) {
      for (let i = 0; i < roots.length; i++) {
        const root = roots[i] || (roots.getIndex ? roots.getIndex(i) : null);
        if (root && root.dom === container) {
          return root;
        }
      }
      // Fallback: choose root whose DOM is contained within the nearest chart container
      try {
        const nearest = container.closest('.chart-box') || container.closest('[data-widget-id]') || container;
        for (let i = 0; i < roots.length; i++) {
          const root = roots[i] || (roots.getIndex ? roots.getIndex(i) : null);
          if (root?.dom && nearest && nearest.contains(root.dom)) {
            return root;
          }
        }
        // As a last resort, if there's only one root, return it
        if (roots.length === 1) {
          return roots[0] || (roots.getIndex ? roots.getIndex(0) : null);
        }
      } catch {}
    }
    
    return null;
  }

  /**
   * Export chart to PNG using amCharts exporting
   */
  private async exportChartToPNG(root: am5.Root): Promise<string | undefined> {
    try {
      // Check if exporting plugin is already added
      let exporting: am5plugins_exporting.Exporting | undefined;
      
      // Iterate through children to find exporting instance
      const children = root.container.children as any;
      if (children && children.each) {
        children.each((child: any) => {
          if (child instanceof am5plugins_exporting.Exporting) {
            exporting = child;
          }
        });
      }
      
      // If not, create new exporting instance
      if (!exporting) {
        exporting = am5plugins_exporting.Exporting.new(root, {
          menu: am5plugins_exporting.ExportingMenu.new(root, {})
        });
      }
      
      // Export to data URL (base64 PNG)
      // Using export method with correct options for amCharts5
      const dataUrl = await exporting.export('png', {
        quality: 0.8,
        width: 1920,
        height: 1080,
        scale: 2
      } as any);
      
      if (!dataUrl || typeof dataUrl !== 'string') {
        return undefined;
      }
      
      // Convert data URL to blob
      const blob = await this.dataURLtoBlob(dataUrl);
      
      // Upload blob to AWS and return s3Key with unique filename
      const uniqueId = this.generateUniqueId();
      const file = new File([blob], `chart-${uniqueId}.png`, { type: 'image/png' });
      // Use valid EnumAssetType expected by backend
      const uploadResult = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      
      return uploadResult?.s3Key;
      
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Fallback exporter: try to capture a canvas first; if none, rasterize the first SVG
   */
  private async exportChartElementFallback(container: HTMLElement): Promise<File | undefined> {
    try {
      // Prefer existing canvas (some charts render to canvas)
      const canvas: HTMLCanvasElement | null = container.querySelector('canvas');
      if (canvas) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.92));
        if (blob) {
          const uniqueId = this.generateUniqueId();
          return new File([blob], `chart-${uniqueId}.png`, { type: 'image/png' });
        }
      }

      // Otherwise, try SVG rasterization
      const svg: SVGElement | null = container.querySelector('svg');
      if (!svg) {
        return undefined;
      }

      // Clone to avoid side effects
      const cloned = svg.cloneNode(true) as SVGElement;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(cloned);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Determine size
      let width = 1200;
      let height = 800;
      const viewBox = cloned.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/\s+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          width = Math.max(600, Math.floor(parts[2]));
          height = Math.max(400, Math.floor(parts[3]));
        }
      }

      const outCanvas = document.createElement('canvas');
      outCanvas.width = width;
      outCanvas.height = height;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) return undefined;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      const pngBlob = await new Promise<Blob | undefined>((resolve) => {
        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0, width, height);
            outCanvas.toBlob((b) => resolve(b || undefined), 'image/png', 0.92);
          } catch (e) {
            resolve(undefined);
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(undefined);
        };
        img.src = url;
      });

      if (!pngBlob) return undefined;
      const uniqueId = this.generateUniqueId();
      return new File([pngBlob], `chart-${uniqueId}.png`, { type: 'image/png' });
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Convert data URL to Blob
   */
  private async dataURLtoBlob(dataURL: string): Promise<Blob> {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
  }

  /**
   * Generate Information chart (bar of data sources) offscreen and return uploaded s3Key
   */
  private async generateInformationChartS3Key(widgetId: string): Promise<string | undefined> {
    try {
      // 1) Fetch information data (dataSources) via the same query used in InformationDialog
      const query = gql`
        mutation GetWidgetDataSources($widgetId: String!, $limitSource: Float) {
          getWidgetDataSources(widgetId: $widgetId, limitSource: $limitSource) {
            dataSources { name count wave }
          }
        }
      `;
      const resp: any = await this.apollo.mutate({
        mutation: query,
        variables: { widgetId, limitSource: 10 }
      }).toPromise();

      const dataSources: Array<{ name: string; count: number; wave?: any }>= resp?.data?.getWidgetDataSources?.dataSources || [];
      if (!dataSources.length) return undefined;

      // Aggregate similar to InformationDialog logic
      const aggregatedMap: Map<string, any> = new Map();
      for (const src of dataSources) {
        const hasWave = src?.wave !== undefined && src?.wave !== null && src?.wave !== '';
        const waveLabel = hasWave ? src.wave : null;
        const key = `${src?.name ?? 'Unknown'}__${hasWave ? waveLabel : 'NOWAVE'}`;
        if (!aggregatedMap.has(key)) {
          aggregatedMap.set(key, {
            category: hasWave ? `${src?.name ?? 'Unknown'} (Wave ${waveLabel})` : `${src?.name ?? 'Unknown'}`,
            count: src?.count ?? 0
          });
        } else {
          const current = aggregatedMap.get(key);
          current.count += (src?.count ?? 0);
        }
      }
      const chartData = Array.from(aggregatedMap.values());

      // 2) Create offscreen container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.height = Math.max(400, chartData.length * 40) + 'px';
      document.body.appendChild(container);

      // 3) Render amCharts XY bar chart
      const root = am5.Root.new(container);
      let s3Key: string | undefined;
      try {
        const chart = root.container.children.push(am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          layout: root.verticalLayout,
        }));

        const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 20 });
        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
          categoryField: 'category',
          renderer: yRenderer
        }));
        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererX.new(root, {})
        }));

        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
          xAxis,
          yAxis,
          valueXField: 'count',
          categoryYField: 'category'
        }));

        // Style columns
        series.columns.template.setAll({
          cornerRadiusTL: 4,
          cornerRadiusBL: 4,
          strokeWidth: 1
        });

        yAxis.data.setAll(chartData);
        series.data.setAll(chartData);

        // Add value labels inside bar end to avoid clipping in exports
        series.bullets.push(() => {
          const label = am5.Label.new(root, {
            text: "{valueX}",
            populateText: true,
            centerY: am5.percent(50),
            centerX: am5.percent(100),
            dx: -8,
            fontSize: 12
          });
          return am5.Bullet.new(root, {
            locationX: 1,
            sprite: label
          });
        });

        // 4) Export to PNG using same exporter and upload
        const s3OrUndefined = await this.exportChartToPNG(root as any);
        s3Key = s3OrUndefined || undefined;
      } finally {
        root.dispose();
        document.body.removeChild(container);
      }

      return s3Key;
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Find metric widget container for card-type widgets
   */
  private findMetricWidgetContainer(): HTMLElement | null {
    const widgetId = this.widget?._id || this.widget?.id;
    if (!widgetId) return null;
    
    // Check if this is a metric/card widget based on widget properties
    const isMetricWidget = this.widget?.chartType === 'CARD' || 
                          this.widget?.widgetType === 'metric' ||
                          this.widget?.type === 'metric';
    
    if (!isMetricWidget) return null;
    
    try {
      // Find the metric widget container relative to the action buttons
      const host: HTMLElement = this.hostEl?.nativeElement;
      const nearestContainer = host.closest('.chart-box') || host.closest('[data-widget-id]') || host.parentElement;
      
      if (nearestContainer) {
        // Try multiple selectors to find metric widget containers
        const selectors = [
          '.metric-widget',
          'app-metric-widget', 
          '.chart-content',
          '.widget-card',
          '.chart-container',
          '[class*="metric"]',
          '[class*="card"]'
        ];
        
        for (const selector of selectors) {
          const metricContainer = nearestContainer.querySelector(selector);
          if (metricContainer instanceof HTMLElement) {
            return metricContainer;
          }
        }
        
        // If no specific metric container found, return the whole widget container
        if (nearestContainer instanceof HTMLElement) {
          return nearestContainer;
        }
      }
    } catch (error) {
      console.warn('Error finding metric widget container:', error);
    }
    
    return null;
  }

  /**
   * Export DOM element to PNG using html-to-image library
   */
  private async exportDomElementToPNG(element: HTMLElement): Promise<string | undefined> {
    try {
      // Ensure element is visible and has dimensions
      if (!element.offsetWidth || !element.offsetHeight) {
        return undefined;
      }
      
      // Use html-to-image to convert DOM element to PNG blob
      const blob = await toBlob(element, {
        quality: 0.95,
        width: Math.max(element.offsetWidth, 400),
        height: Math.max(element.offsetHeight, 300),
        backgroundColor: '#ffffff',
        pixelRatio: 1,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        filter: (node: any) => {
          // Allow all nodes except specific UI elements
          if (node && node.classList) {
            const excludeClasses = [
              'actions-buttons',
              'export-wrapper', 
              'display-mode-toggle',
              'mat-menu',
              'cdk-overlay'
            ];
            return !excludeClasses.some(cls => node.classList.contains(cls));
          }
          return true;
        }
      });
      
      if (!blob) {
        return undefined;
      }
      
      // Convert blob to file and upload
      const uniqueId = this.generateUniqueId();
      const file = new File([blob], `metric-widget-${uniqueId}.png`, { type: 'image/png' });
      
      const uploadResult = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return uploadResult?.s3Key;
      
    } catch (error) {
      console.error('Error exporting DOM element to PNG:', error);
      return undefined;
    }
  }

  /**
   * Generate unique ID for filenames using date + milliseconds + random string
   */
  private generateUniqueId(): string {
    const now = new Date();
    const dateStr = now.getFullYear() + 
                   (now.getMonth() + 1).toString().padStart(2, '0') + 
                   now.getDate().toString().padStart(2, '0');
    const timeStr = now.getTime().toString();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${dateStr}-${timeStr}-${randomStr}`;
  }

}



