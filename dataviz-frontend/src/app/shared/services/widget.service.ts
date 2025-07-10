import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dashboard, Section, Widget, MOCK_DASHBOARD } from '../models/widget.types';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private dashboardSubject = new BehaviorSubject<Dashboard>(MOCK_DASHBOARD);
  public dashboard$ = this.dashboardSubject.asObservable();

  constructor() {}

  // Get current dashboard
  getDashboard(): Dashboard {
    return this.dashboardSubject.value;
  }

  // Get dashboard as observable
  getDashboardObservable(): Observable<Dashboard> {
    return this.dashboardSubject.asObservable();
  }

  // Update dashboard
  updateDashboard(dashboard: Dashboard): void {
    this.dashboardSubject.next(dashboard);
  }

  // Get section by name
  getSection(sectionName: string): Section | undefined {
    const dashboard = this.getDashboard();
    return dashboard.sections.find(section => section.name === sectionName);
  }

  // Get widget by name and section
  getWidget(sectionName: string, widgetName: string): Widget | undefined {
    const section = this.getSection(sectionName);
    return section?.widgets.find(widget => widget.name === widgetName);
  }

  // Update widget
  updateWidget(sectionName: string, widgetName: string, updatedWidget: Partial<Widget>): void {
    const dashboard = this.getDashboard();
    const sectionIndex = dashboard.sections.findIndex(s => s.name === sectionName);
    
    if (sectionIndex !== -1) {
      const widgetIndex = dashboard.sections[sectionIndex].widgets.findIndex(w => w.name === widgetName);
      
      if (widgetIndex !== -1) {
        dashboard.sections[sectionIndex].widgets[widgetIndex] = {
          ...dashboard.sections[sectionIndex].widgets[widgetIndex],
          ...updatedWidget
        };
        this.updateDashboard(dashboard);
      }
    }
  }

  // Toggle widget visibility
  toggleWidgetVisibility(sectionName: string, widgetName: string): void {
    const widget = this.getWidget(sectionName, widgetName);
    if (widget) {
      this.updateWidget(sectionName, widgetName, { visible: !widget.visible });
    }
  }

  // Get visible widgets for a section
  getVisibleWidgets(sectionName: string): Widget[] {
    const section = this.getSection(sectionName);
    return section?.widgets.filter(widget => widget.visible) || [];
  }

  // Load dashboard from API (placeholder for future implementation)
  loadDashboardFromAPI(source: string): Promise<Dashboard> {
    // This would be replaced with actual API call
    return Promise.resolve(MOCK_DASHBOARD);
  }
} 