import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {

  private dashboardId: string | null = null;
  private isDashboard: boolean = false; 
  constructor() { }

  setDashboardId(id: string) {
    this.dashboardId = id;
    localStorage.setItem('dashboardId', this.dashboardId);
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
}
