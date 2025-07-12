/**
 * DashboardService is responsible for handling Dashboard-related operations.
 * It interacts with the DashboardService to perform Dashboard data and other Dashboard tasks.
 * This service is used by components to manage data Dashboard.
 */

import { Injectable } from "@angular/core";
import { RepositoryFactory } from "@dataviz/repositories/repository.factory";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private dashboardRepository;

  constructor() {
    this.dashboardRepository =
      RepositoryFactory.createRepository("dashboard-builder");
  }

  async createDashboard(DashboardInput: any) {
    return await this.dashboardRepository.createDashboard(DashboardInput);
  }

  async deleteDashboard(id: string) {
    return await this.dashboardRepository.deleteDashboard(id);
  }

  async updateDashboard(id: string, DashboardInput: any) {
    return await this.dashboardRepository.updateDashboard(
      id,
      DashboardInput
    );
  }

  async getAllDashboards(pagination: any, sorting: any, filter: any) {
    return await this.dashboardRepository.getAllDashboards(
      pagination,
      sorting,
      filter
    );
  }

  async getDropdownDashboards() {
    return await this.dashboardRepository.getDropdownDashboards();
  }

  async getOneDashboard(id: string) {
    return await this.dashboardRepository.getOneDashboard(id);
  }
}

// Example usage:
// const authService = new AuthenticationService();
// userService.getUserDetails('123').then(user => console.log(user)).catch(error => console.error(error));
