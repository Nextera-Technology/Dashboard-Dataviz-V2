/**
 * ClassRepository is responsible for interacting with the backend to perform authentication-related operations.
 * It uses GraphQL and REST clients to handle login, password reset, and other authentication tasks.
 * This repository is used by the AuthenticationService to manage user authentication.
 */
import { inject } from '@angular/core';
import { GraphqlClient } from '@dataviz/graphql/client';
import { gqlCreateUser, gqlLogin } from '@dataviz/graphql/mutations/users/users.mutation';

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
   * Create a new user using GraphQL.
   * @returns {Promise<any>} - The creation result.
   */
  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error('User input is required');
    }
    const mutation = gqlLogin;
    const variables = { email, password };

    try {
      const mutationResult = await this._client.GraphqlMutate(
        mutation,
        variables,
      );

      return mutationResult.login;
    } catch (error) {
      throw {
        message: 'Failed to create user.',
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }
}
