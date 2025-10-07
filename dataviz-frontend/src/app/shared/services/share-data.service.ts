import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {

  private dashboardId: string | null = null;
  private isDashboard: boolean = false; 
  private dashboardIdSubject = new BehaviorSubject<string | null>(null);
  public dashboardId$ = this.dashboardIdSubject.asObservable();
  
  // Track which dashboard is actually loaded in DashboardComponent
  private loadedDashboardIdSubject = new BehaviorSubject<string | null>(null);
  public loadedDashboardId$ = this.loadedDashboardIdSubject.asObservable();

  constructor() {
    // Initialize dashboardId from localStorage if available
    const saved = localStorage.getItem('dashboardId');
    if (saved) {
      this.dashboardId = saved;
      this.dashboardIdSubject.next(saved);
    }
  }

  setDashboardId(id: string) {
    this.dashboardId = id;
    localStorage.setItem('dashboardId', this.dashboardId);
    this.dashboardIdSubject.next(id);
  }

  getDashboardId(): string | null {
    if (!this.dashboardId) {
      return localStorage.getItem('dashboardId');
    }
    return this.dashboardId;
  }

  setIsDashboard(isDashboard: boolean) {
    
    this.isDashboard = isDashboard;
  }
  getIsDashboard(): boolean {
    return this.isDashboard;
  }

  // Mark which dashboard has been fully loaded by DashboardComponent
  setLoadedDashboardId(id: string) {
    this.loadedDashboardIdSubject.next(id);
  }

  getLoadedDashboardId(): string | null {
    return this.loadedDashboardIdSubject.getValue();
  }
}
