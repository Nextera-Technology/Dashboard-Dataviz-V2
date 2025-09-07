/**
 * ClassRepository is responsible for interacting with the backend to perform authentication-related operations.
 * It uses GraphQL and REST clients to handle login, password reset, and other authentication tasks.
 * This repository is used by the AuthenticationService to manage user authentication.
 */
import { inject, Injectable } from "@angular/core";
import { GraphqlClient } from "@dataviz/graphql/client";
import {
  gqlCreateDashboard,
  gqlDeleteDashboard,
  gqlUpdateDashboard,
  gqlCreateSection,
  gqlDeleteSection,
  gqlUpdateSection,
  gqlCreateWidget,
  gqlUpdateWidget,
  gqlDeleteWidget,
  gqlWidgetSourceData,
  gqlExportWidgetData,
  gqlRegenerateAutoAnalysisDashboard,
  gqlDuplicateDashboardFromOther
} from "@dataviz/graphql/mutations/dashboard-builder/dashboard-builder.mutation";
import {
  gqlGetAllDashboard,
  gqlOpenDashboardWithSchoolFilter,
  gqlGetChartOptions,
  gqlGetOneDashboard,
  gqlGetDashboardTemplates,
  gqlGetSchoolDropdown
} from "@dataviz/graphql/queries/dashboard-builder/dashboard-builder.query";

@Injectable({
  providedIn: "root",
})
export class DashboardBuilderRepository {
  _client = inject(GraphqlClient);

  constructor() {}

  /**
   * Create a new Dashboard using GraphQL.
   * @param {any} input - The input data for the Dashboard.
   * @returns {Promise<any>} - The creation result.
   */
  async createDashboard(input: any) {
    if (!input) {
      throw new Error("Dashboard input is required");
    }
    const mutation = gqlCreateDashboard;
    const variables = { input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.createDashboard;
    } catch (error) {
      throw {
        message: "Failed to create Dashboard.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Delete a Dashboard using GraphQL.
   * @param {string} id - The ID of the Dashboard to delete.
   * @returns {Promise<any>} - The deletion result.
   */
  async deleteDashboard(id: string) {
    if (!id) {
      throw new Error("Dashboard ID is required for deletion");
    }
    const mutation = gqlDeleteDashboard;
    const variables = { id };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.deleteDashboard;
    } catch (error) {
      throw {
        message: "Failed to delete Dashboard.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Update a Dashboard using GraphQL.
   * @param {string} id - The ID of the Dashboard to update.
   * @param {any} input - The input data for the Dashboard update.
   * @returns {Promise<any>} - The update result.
   */
  async updateDashboard(id: string, input: any) {
    if (!id || !input) {
      throw new Error("Dashboard ID and input are required for update");
    }
    const mutation = gqlUpdateDashboard;
    const variables = { id, input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.updateDashboard;
    } catch (error) {
      throw {
        message: "Failed to update Dashboard.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Create a new Section using GraphQL.
   * @param {any} input - The input data for the Section.
   * @returns {Promise<any>} - The creation result.
   */
  async createSection(input: any) {
    if (!input) {
      throw new Error("Section input is required");
    }
    const mutation = gqlCreateSection;
    const variables = { input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.createSection;
    } catch (error) {
      throw {
        message: "Failed to create Section.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Delete a Section using GraphQL.
   * @param {string} id - The ID of the Section to delete.
   * @returns {Promise<any>} - The deletion result.
   */
  async deleteSection(id: string) {
    if (!id) {
      throw new Error("Section ID is required for deletion");
    }
    const mutation = gqlDeleteSection;
    const variables = { id };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.deleteSection;
    } catch (error) {
      throw {
        message: "Failed to delete Section.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Update a Section using GraphQL.
   * @param {string} id - The ID of the Section to update.
   * @param {any} input - The input data for the Section update.
   * @returns {Promise<any>} - The update result.
   */
  async updateSection(id: string, input: any) {
    if (!id || !input) {
      throw new Error("Section ID and input are required for update");
    }
    const mutation = gqlUpdateSection;
    const variables = { id, input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.updateSection;
    } catch (error) {
      throw {
        message: "Failed to update Section.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Create a new Widget using GraphQL.
   * @param {any} input - The input data for the Widget.
   * @returns {Promise<any>} - The creation result.
   */
  async createWidget(input: any) {
    if (!input) {
      throw new Error("Widget input is required");
    }
    const mutation = gqlCreateWidget;
    const variables = { input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.createWidget;
    } catch (error) {
      throw {
        message: "Failed to create Widget.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Update a Widget using GraphQL.
   * @param {string} id - The ID of the Widget to update.
   * @param {any} input - The input data for the Widget update.
   * @returns {Promise<any>} - The update result.
   */
  async updateWidget(id: string, input: any) {
    if (!id || !input) {
      throw new Error("Widget ID and input are required for update");
    }
    const mutation = gqlUpdateWidget;
    const variables = { id, input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.updateWidget;
    } catch (error) {
      throw {
        message: "Failed to update Widget.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Delete a Widget using GraphQL.
   * @param {string} id - The ID of the Widget to delete.
   * @returns {Promise<any>} - The deletion result.
   */
  async deleteWidget(id: string) {
    if (!id) {
      throw new Error("Widget ID is required for deletion");
    }
    const mutation = gqlDeleteWidget;
    const variables = { id };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.deleteWidget;
    } catch (error) {
      throw {
        message: "Failed to delete Widget.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Get all Dashboards using GraphQL.
   * @param {any} filter - The filter input.
   * @returns {Promise<any>} - The query result.
   */
  async getAllDashboards(filter: any) {
    const query = gqlGetAllDashboard;
    const variables = { filter };
    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      return queryResult.getAllDashboards;
    } catch (error) {
      throw {
        message: "Failed to get all Dashboards.",
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Get one Dashboard by ID using GraphQL.
   * @param {string} id - The ID of the Dashboard to retrieve.
   * @returns {Promise<any>} - The query result.
   */
  async getOneDashboard(id: string) {
    if (!id) {
      throw new Error("Dashboard ID is required to get one");
    }
    const query = gqlGetOneDashboard;
    const variables = { id };
    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      return queryResult.getOneDashboard;
    } catch (error) {
      throw {
        message: "Failed to get one Dashboard.",
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Open dashboard with school filter using GraphQL.
   * @param {string} dashboardId - The ID of the Dashboard to open.
   * @param {string[]} schoolFilters - Array of school filters to apply.
   * @returns {Promise<any>} - The query result.
   */
  async openDashboardWithSchoolFilter(dashboardId: string, schoolFilters: string[]) {
    console.log('DashboardBuilderRepository: openDashboardWithSchoolFilter called');
    console.log('Parameters:', { dashboardId, schoolFilters });
    
    if (!dashboardId || !schoolFilters) {
      throw new Error("Dashboard ID and school filters are required");
    }
    
    const query = gqlOpenDashboardWithSchoolFilter;
    
    const variables = { dashboardId, schoolFilters };
    
    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      
      const result = queryResult.openDashboardWithSchoolFilter;
      console.log('Extracted result:', result);
      
      return result;
    } catch (error) {
      console.error('GraphQL query failed in repository:', error);
      throw {
        message: "Failed to open dashboard with school filter.",
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Get one Dashboard by ID using GraphQL.
   * @param The ID of the Dashboard to retrieve.
   * @returns {Promise<any>} - The query result.
   */
  async getChartOptions(isForJobDescription?: boolean) {
    const query = gqlGetChartOptions;
    const variables = isForJobDescription ? { isForJobDescription } : {};
    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      return queryResult.getChartOptions;
    } catch (error) {
      throw {
        message: "Failed to get chart options.",
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   
   */
  async getWidgetDataSources(id: string) {
    if (!id) {
      throw new Error("Dashboard input is required");
    }
    const mutation = gqlWidgetSourceData;
    const variables = { id };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.createDashboard;
    } catch (error) {
      throw {
        message: "Failed to create Dashboard.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Export widget data via GraphQL, returning a downloadable filename.
   */
  async exportWidgetData(widgetId: string, exportType: string) {
    if (!widgetId || !exportType) {
      throw new Error("widgetId and exportType are required");
    }
    const mutation = gqlExportWidgetData;
    const variables = { widgetId, exportType };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );
      return mutationResult?.getExportedWidgetData;
    } catch (error) {
      throw {
        message: "Failed to export widget data.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Regenerate auto analysis for a dashboard using GraphQL.
   * @param {string} dashboardId - The ID of the dashboard to regenerate.
   * @returns {Promise<any>} - The regeneration result.
   */
  async regenerateAutoAnalysisDashboard(dashboardId: string) {
    if (!dashboardId) {
      throw new Error("Dashboard ID is required");
    }
    const mutation = gqlRegenerateAutoAnalysisDashboard;
    const variables = { dashboardId };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables
      );

      return mutationResult.regenerateAutoAnalysisDashboard;
    } catch (error) {
      throw {
        message: "Failed to regenerate dashboard auto analysis.",
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  async getDashboardTemplates(type: string, isForJobDescription?: boolean) {
    const query = gqlGetDashboardTemplates;
    const variables = { type, isForJobDescription };

    try {
      const result = await this._client.GraphqlQuery(query, variables);
      return result.getDashboardTemplates;
    } catch (error) {
      throw {
        message: "Failed to fetch dashboard templates.",
        originalError: error,
        query: query,
        input: JSON.stringify(variables),
      };
    }
  }

  async duplicateDashboardFromOther(input: any) {
    const mutation = gqlDuplicateDashboardFromOther;
    const variables = { input };

    try {
      const mutationResult = await this._client.GraphqlMutate(mutation, variables);
      return mutationResult.duplicateDashboardFromOther;
    } catch (error) {
      throw {
        message: "Failed to duplicate dashboard.",
        originalError: error,
        mutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Get school dropdown options for a specific dashboard using GraphQL.
   * @param {string} dashboardId - The ID of the dashboard to get schools for.
   * @returns {Promise<string[]>} - Array of school names.
   */
  async getSchoolDropdown(dashboardId: string) {
    if (!dashboardId) {
      throw new Error("Dashboard ID is required");
    }
    const query = gqlGetSchoolDropdown;
    const variables = { dashboardId };

    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      return queryResult.getSchoolDropdown;
    } catch (error) {
      throw {
        message: "Failed to get school dropdown options.",
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }
}
