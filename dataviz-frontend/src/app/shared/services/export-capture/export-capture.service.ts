import { Injectable, inject } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';
import { Apollo, gql } from 'apollo-angular';
import { DashboardBuilderRepository } from '@dataviz/repositories/dashboard-builder/dashboard-builder.repository';
// @ts-ignore
import { toBlob } from 'html-to-image';

/**
 * Service for capturing widget charts and exporting to PNG/S3
 * Refactored from ActionsButtonsComponent for reusability
 */
@Injectable({
  providedIn: 'root'
})
export class ExportCaptureService {
  private dashboardRepo = inject(DashboardBuilderRepository);
  private apollo = inject(Apollo);

  constructor() {}

  /**
   * Capture widget and generate S3 keys for display chart and information chart
   * @param widgetId - Widget ID to capture
   * @param widget - Widget data object
   * @returns Object with displayChartS3Key and lineChartS3Key
   */
  async captureWidgetImages(widgetId: string, widget: any): Promise<{
    displayChartS3Key: string | null;
    lineChartS3Key: string | null;
  }> {
    let displayChartS3Key: string | null = null;
    let lineChartS3Key: string | null = null;

    try {
      // 1. Capture display chart
      const chartContainer = this.findChartContainer(widgetId, widget);
      
      if (!chartContainer) {
        console.warn(`[Export] Container not found for widget ${widgetId}, type: ${widget?.chartType}`);
      }
      
      if (chartContainer) {
        console.log(`[Export] Found container for widget ${widgetId}, size: ${chartContainer.offsetWidth}x${chartContainer.offsetHeight}`);
        
        // Ensure container is actually rendered before capture
        await this.waitForContainerReady(chartContainer, 4000);

        const isMetricWidget = widget?.chartType === 'CARD' || 
                              widget?.widgetType === 'metric' ||
                              widget?.type === 'metric';
        
        if (isMetricWidget) {
          // Use html-to-image for metric/card widgets
          displayChartS3Key = await this.exportDomElementToPNG(chartContainer);
          
          // Fallback to canvas/SVG rasterization if html-to-image failed
          if (!displayChartS3Key) {
            const fallbackFile = await this.exportChartElementFallback(chartContainer);
            if (fallbackFile) {
              const uploadRes = await this.dashboardRepo.uploadPublicAsset(fallbackFile, 'IMAGE');
              displayChartS3Key = uploadRes?.s3Key || null;
            }
          }
        } else {
          // Try amCharts export for chart widgets
          const root = this.getChartRoot(chartContainer);
          if (root) {
            displayChartS3Key = await this.exportChartToPNG(root);
          }

          // Fallback to DOM export if amCharts failed
          if (!displayChartS3Key) {
            displayChartS3Key = await this.exportDomElementToPNG(chartContainer);
          }
        }
      }

      // 2. Generate information chart
      lineChartS3Key = await this.generateInformationChartS3Key(widgetId);

    } catch (error) {
      console.error('Error capturing widget images:', error);
    }

    return { displayChartS3Key, lineChartS3Key };
  }

  /**
   * Wait until the container has a non-zero size and likely chart content (canvas/svg/amCharts root)
   */
  private async waitForContainerReady(container: HTMLElement, timeoutMs = 3000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const rect = container.getBoundingClientRect();
      const hasSize = rect.width > 5 && rect.height > 5;
      const hasCanvas = !!container.querySelector('canvas');
      const hasSvg = !!container.querySelector('svg');
      const hasAmRoot = (container as any)._amRoot != null;
      if (hasSize && (hasCanvas || hasSvg || hasAmRoot)) return;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  /**
   * Find chart container element for widget
   */
  private findChartContainer(widgetId: string, widget: any): HTMLElement | null {
    // Priority 1: Check wrapper added in section.component.ts
    const wrapper = document.getElementById(`chart-div-${widgetId}`);
    if (wrapper) {
      // For chart widgets, find the actual chart container inside wrapper
      const chartContainer = wrapper.querySelector('.chart-container');
      if (chartContainer instanceof HTMLElement) {
        return chartContainer;
      }
      
      // For metric/card widgets, the wrapper itself might be the container
      const isMetricWidget = widget?.chartType === 'CARD' || 
                            widget?.widgetType === 'metric' ||
                            widget?.type === 'metric';
      if (isMetricWidget) {
        // Look for metric widget component inside wrapper
        const metricWidget = wrapper.querySelector('app-metric-widget') || 
                            wrapper.querySelector('.metric-widget') ||
                            wrapper.querySelector('.chart-content');
        if (metricWidget instanceof HTMLElement) {
          return metricWidget;
        }
        // Fall back to wrapper itself
        return wrapper;
      }
      
      // If no specific container found, return wrapper
      return wrapper;
    }
    
    // Priority 2: Try data-widget-id attribute
    const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (widgetElement) {
      const chartEl = widgetElement.querySelector('.chart-container') || 
                      widgetElement.querySelector('[class*="chart-div"]');
      if (chartEl instanceof HTMLElement) {
        return chartEl;
      }
      if (widgetElement instanceof HTMLElement) {
        return widgetElement;
      }
    }
    
    // Priority 3: Legacy specific chart IDs
    const possibleIds = [
      `pie-chart-div-${widgetId}`,
      `bar-chart-div-${widgetId}`,
      `line-chart-div-${widgetId}`,
      `column-chart-div-${widgetId}`,
      `sankey-chart-div-${widgetId}`,
      `map-div-${widgetId}`,
      `map-chart-div-${widgetId}`,
      `students-map-chart-div-${widgetId}`,
      `salary-map-chart-div-${widgetId}`,
      `widget-chart-${widgetId}`
    ];
    
    for (const id of possibleIds) {
      const element = document.getElementById(id);
      if (element) {
        return element;
      }
    }
    
    return null;
  }

  /**
   * Get amCharts Root instance from container
   */
  private getChartRoot(container: HTMLElement): am5.Root | null {
    const anyContainer = container as any;
    if (anyContainer._amRoot) {
      return anyContainer._amRoot;
    }
    
    const roots = am5.registry.rootElements as any;
    if (roots && roots.length) {
      for (let i = 0; i < roots.length; i++) {
        const root = roots[i] || (roots.getIndex ? roots.getIndex(i) : null);
        if (root && root.dom === container) {
          return root;
        }
      }
      
      // Fallback: find root whose DOM is within container
      const nearest = container.closest('.chart-box') || container.closest('[data-widget-id]') || container;
      for (let i = 0; i < roots.length; i++) {
        const root = roots[i] || (roots.getIndex ? roots.getIndex(i) : null);
        if (root?.dom && nearest && nearest.contains(root.dom)) {
          return root;
        }
      }
      
      if (roots.length === 1) {
        return roots[0] || (roots.getIndex ? roots.getIndex(0) : null);
      }
    }
    
    return null;
  }

  /**
   * Export chart to PNG using amCharts exporting
   */
  private async exportChartToPNG(root: am5.Root): Promise<string | null> {
    try {
      let exporting: am5plugins_exporting.Exporting | undefined;
      
      const children = root.container.children as any;
      if (children && children.each) {
        children.each((child: any) => {
          if (child instanceof am5plugins_exporting.Exporting) {
            exporting = child;
          }
        });
      }
      
      if (!exporting) {
        exporting = am5plugins_exporting.Exporting.new(root, {
          menu: am5plugins_exporting.ExportingMenu.new(root, {})
        });
      }
      
      const dataUrl = await exporting.export('png', {
        quality: 0.8,
        width: 1920,
        height: 1080,
        scale: 2
      } as any);
      
      if (!dataUrl || typeof dataUrl !== 'string') {
        return null;
      }
      
      const blob = await this.dataURLtoBlob(dataUrl);
      const uniqueId = this.generateUniqueId();
      const file = new File([blob], `chart-${uniqueId}.png`, { type: 'image/png' });
      
      const uploadResult = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return uploadResult?.s3Key || null;
      
    } catch (error) {
      console.error('Error exporting chart to PNG:', error);
      return null;
    }
  }

  /**
   * Export DOM element to PNG using html-to-image
   */
  private async exportDomElementToPNG(element: HTMLElement): Promise<string | null> {
    try {
      if (!element.offsetWidth || !element.offsetHeight) {
        return null;
      }
      
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
        return null;
      }
      
      const uniqueId = this.generateUniqueId();
      const file = new File([blob], `widget-${uniqueId}.png`, { type: 'image/png' });
      
      const uploadResult = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return uploadResult?.s3Key || null;
      
    } catch (error) {
      console.error('Error exporting DOM element to PNG:', error);
      return null;
    }
  }

  /**
   * Fallback exporter: try to capture a canvas first; if none, rasterize the first SVG
   */
  private async exportChartElementFallback(container: HTMLElement): Promise<File | null> {
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
        return null;
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
      if (!ctx) return null;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      const pngBlob = await new Promise<Blob | null>((resolve) => {
        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0, width, height);
            outCanvas.toBlob((b) => resolve(b || null), 'image/png', 0.92);
          } catch (e) {
            resolve(null);
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });

      if (!pngBlob) return null;
      const uniqueId = this.generateUniqueId();
      return new File([pngBlob], `chart-${uniqueId}.png`, { type: 'image/png' });
    } catch (err) {
      return null;
    }
  }

  /**
   * Generate Information chart (bar of data sources) offscreen
   */
  private async generateInformationChartS3Key(widgetId: string): Promise<string | null> {
    try {
      const query = gql`
        mutation GetWidgetDataSources($widgetId: String!) {
          getWidgetDataSources(widgetId: $widgetId) {
            dataSources { name count wave }
          }
        }
      `;
      
      const resp: any = await this.apollo.mutate({
        mutation: query,
        variables: { widgetId }
      }).toPromise();

      const dataSources: Array<{ name: string; count: number; wave?: any }> = 
        resp?.data?.getWidgetDataSources?.dataSources || [];
      
      if (!dataSources.length) return null;

      // Aggregate data
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

      // Create offscreen container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.height = Math.max(400, chartData.length * 40) + 'px';
      document.body.appendChild(container);

      // Render chart
      const root = am5.Root.new(container);
      let s3Key: string | null = null;
      
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

        yAxis.data.setAll(chartData);
        series.data.setAll(chartData);

        s3Key = await this.exportChartToPNG(root as any);
      } finally {
        root.dispose();
        document.body.removeChild(container);
      }

      return s3Key;
    } catch (err) {
      console.error('Error generating information chart:', err);
      return null;
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
   * Generate unique ID for filenames
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
