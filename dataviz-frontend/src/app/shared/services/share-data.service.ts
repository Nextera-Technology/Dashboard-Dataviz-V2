import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {

  private dashboardId: string | null = null;
  constructor() { }

  setDashboardId(id: string) {
    this.dashboardId = id;
  }

  getDashboardId(): string | null {
    return this.dashboardId;
  }
}
