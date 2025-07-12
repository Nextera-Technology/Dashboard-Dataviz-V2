/**
 * ClassRepository is responsible for interacting with the backend to perform authentication-related operations.
 * It uses GraphQL and REST clients to handle login, password reset, and other authentication tasks.
 * This repository is used by the AuthenticationService to manage user authentication.
 */
import { inject } from '@angular/core';
import { GraphqlClient } from '@nextera/graphql/client';
import { gqlCreateUser, gqlDeleteUser, gqlUpdateUser } from '@nextera/graphql/mutations/users/users.mutation';
import { gqlGetAllUsers, gqlGetOneUser, gqlGetDropdownUsers } from '@nextera/graphql/queries/users/users.query';

export class UsersRepository {
  _client = inject(GraphqlClient);

  constructor() {}

  /**
   * Create a new user using GraphQL.
   * @param {any} input - The input data for the user.
   * @returns {Promise<any>} - The creation result.
   */
  async createUser(input: any) {
    if (!input) {
      throw new Error('User input is required');
    }
    const mutation = gqlCreateUser;
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
   * Delete a user using GraphQL.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<any>} - The deletion result.
   */
  async deleteUser(id: string) {
    if (!id) {
      throw new Error('User ID is required');
    }
    const mutation = gqlDeleteUser;
    const variables = { id };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables,
      );

      return mutationResult.deleteUser;
    } catch (error) {
      throw {
        message: 'Failed to delete user.',
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Update a user using GraphQL.
   * @param {string} id - The ID of the user to update.
   * @param {any} input - The input data for the user.
   * @returns {Promise<any>} - The update result.
   */
  async updateUser(id: string, input: any) {
    if (!id || !input) {
      throw new Error('User ID and input are required');
    }
    const mutation = gqlUpdateUser;
    const variables = { id, input };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables,
      );

      return mutationResult.updateUser;
    } catch (error) {
      throw {
        message: 'Failed to update user.',
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
  async getAllUsers(pagination: any, sorting: any, filter: any) {
    const query = gqlGetAllUsers;
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

  /**
   * Get one user using GraphQL.
   * @param {string} id - The ID of the user to get.
   * @returns {Promise<any>} - The query result.
   */
  async getOneUser(id: string) {
    if (!id) {
      throw new Error('User ID is required');
    }
    const query = gqlGetOneUser;
    const variables = { id };

    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      return queryResult.getOneUser;
    } catch (error) {
      throw {
        message: 'Failed to get user.',
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }

  async getDropdownUsers() {
    const query = gqlGetDropdownUsers;
    const variables = {};

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
