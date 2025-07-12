/**
 * ClassRepository is responsible for interacting with the backend to perform authentication-related operations.
 * It uses GraphQL and REST clients to handle login, password reset, and other authentication tasks.
 * This repository is used by the AuthenticationService to manage user authentication.
 */
import { inject } from '@angular/core';
import { GraphqlClient } from '@dataviz/graphql/client';
import { gqlCreateDashboardBuilder } from '@dataviz/graphql/mutations/dashboard-builder/dashboard-builder.mutation';
import { gqlGetAllDashboardBuilder } from '@dataviz/graphql/queries/dashboard-builder/dashboard-builder.query';

export class DashboardBuilderRepository {
  _client = inject(GraphqlClient);

  constructor() {}

  /**
   * Create a new user using GraphQL.
   * @param {any} input - The input data for the user.
   * @returns {Promise<any>} - The creation result.
   */
  async createDashboardBuilder(input: any) {
    if (!input) {
      throw new Error('User input is required');
    }
    const mutation = gqlCreateDashboardBuilder;
    const variables = { input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables,
      );

      return mutationResult.createUser;
    } catch (error) {
      throw {
        message: 'Failed to create user.',
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Get all users using GraphQL.
   * @param {any} pagination - The pagination input.
   * @param {any} sorting - The sorting input.
   * @param {any} filter - The filter input.
   * @returns {Promise<any>} - The query result.
   */
  async getAllDashboardBuilder(pagination: any, sorting: any, filter: any) {
    const query = gqlGetAllDashboardBuilder;
    const variables = { pagination, sorting, filter };
    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      return queryResult.getAllUser;
    } catch (error) {
      throw {
        message: 'Failed to get all users.',
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }
}
