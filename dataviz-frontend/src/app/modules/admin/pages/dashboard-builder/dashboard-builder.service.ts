/**
 * DashboardBuilderService is responsible for handling DashboardBuilder-related operations.
 * It interacts with the DashboardBuilderService to perform DashboardBuilder data and other DashboardBuilder tasks.
 * This service is used by components to manage data DashboardBuilder.
 */

import { Injectable } from "@angular/core";
import { RepositoryFactory } from "@dataviz/repositories/repository.factory";

@Injectable({
  providedIn: "root",
})
export class DashboardBuilderService {
  private dashboardBuilderRepository;

  constructor() {
    this.dashboardBuilderRepository =
      RepositoryFactory.createRepository("dashboard-builder");
  }

  async createDashboardBuilder(DashboardBuilderInput: any) {
    return await this.dashboardBuilderRepository.createDashboardBuilder(DashboardBuilderInput);
  }

  async deleteDashboardBuilder(id: string) {
    return await this.dashboardBuilderRepository.deleteDashboardBuilder(id);
  }

  async updateDashboardBuilder(id: string, DashboardBuilderInput: any) {
    return await this.dashboardBuilderRepository.updateDashboardBuilder(
      id,
      DashboardBuilderInput
    );
  }

  async getAllDashboardBuilders(pagination: any, sorting: any, filter: any) {
    return await this.dashboardBuilderRepository.getAllDashboardBuilders(
      pagination,
      sorting,
      filter
    );
  }

  async getDropdownDashboardBuilders() {
    return await this.dashboardBuilderRepository.getDropdownDashboardBuilders();
  }

  async getOneDashboardBuilder(id: string) {
    return await this.dashboardBuilderRepository.getOneDashboardBuilder(id);
  }
}

// Example usage:
// const authService = new AuthenticationService();
// userService.getUserDetails('123').then(user => console.log(user)).catch(error => console.error(error));
