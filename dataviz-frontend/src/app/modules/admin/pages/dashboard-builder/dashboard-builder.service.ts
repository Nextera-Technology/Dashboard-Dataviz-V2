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

  async createDashboard(DashboardInput: any) {
    return await this.dashboardBuilderRepository.createDashboard(
      DashboardInput
    );
  }

  async deleteDashboard(id: string) {
    return await this.dashboardBuilderRepository.deleteDashboard(id);
  }

  async updateDashboard(id: string, DashboardInput: any) {
    return await this.dashboardBuilderRepository.updateDashboard(
      id,
      DashboardInput
    );
  }

  async createSection(SectionInput: any) {
    return await this.dashboardBuilderRepository.createSection(SectionInput);
  }

  async deleteSection(id: string) {
    return await this.dashboardBuilderRepository.deleteSection(id);
  }

  async updateSection(id: string, SectionInput: any) {
    return await this.dashboardBuilderRepository.updateSection(
      id,
      SectionInput
    );
  }

  async createWidget(WidgetInput: any) {
    return await this.dashboardBuilderRepository.createWidget(WidgetInput);
  }

  async deleteWidget(id: string) {
    return await this.dashboardBuilderRepository.deleteWidget(id);
  }

  async updateWidget(id: string, WidgetInput: any) {
    return await this.dashboardBuilderRepository.updateWidget(id, WidgetInput);
  }

  async getAllDashboards(filter: any) {
    return await this.dashboardBuilderRepository.getAllDashboards(filter);
  }

  async getOneDashboard(id: string) {
    return await this.dashboardBuilderRepository.getOneDashboard(id);
  }

  replaceUnderscoresPipe(value: string | null | undefined): string {
    if (value === null || value === undefined) {
      return "";
    }
    return value.replace(/_/g, " ");
  }
}

// Example usage:
// const authService = new AuthenticationService();
// userService.getUserDetails('123').then(user => console.log(user)).catch(error => console.error(error));
