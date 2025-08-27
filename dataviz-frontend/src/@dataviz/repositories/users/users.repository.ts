/**
 * ClassRepository is responsible for interacting with the backend to perform authentication-related operations.
 * It uses GraphQL and REST clients to handle login, password reset, and other authentication tasks.
 * This repository is used by the AuthenticationService to manage user authentication.
 */
import { inject } from '@angular/core';
import { GraphqlClient } from '@dataviz/graphql/client';
import {
  gqlCreateUser,
  gqlLogin,
  gqlDeleteUser,
  gqlUpdateUser,
} from '@dataviz/graphql/mutations/users/users.mutation';
import { gqlGetAllUsers } from '@dataviz/graphql/queries/users/users.query';

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
      const mutationResult = await this._client.GraphqlMutate(mutation, variables);

      return mutationResult?.createUser;
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
      const mutationResult = await this._client.GraphqlMutate(mutation, variables);

      return mutationResult?.login;
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
   * Fetch all users from backend and map to a simpler shape
   */
  async getAllUsers(pagination?: any, sorting?: any, filter?: any) {
    const query = gqlGetAllUsers;
    const variables = { pagination: pagination || null, sorting: sorting || null, filter: filter || null };
    try {
      const queryResult = await this._client.GraphqlQuery(query, variables);
      const users = queryResult?.getAllUser?.data || [];
      // Map backend shape to local shape — robust parsing for several backend variants
      const toId = (val: any) => {
        if (!val) return undefined;
        if (typeof val === 'string') return val;
        if (val.$oid) return val.$oid;
        if (val._id) return val._id;
        return undefined;
      };

      const parseDate = (d: any) => {
        if (!d) return undefined;
        if (typeof d === 'string') return new Date(d);
        if (d.$date) return new Date(d.$date);
        if (d instanceof Date) return d;
        return undefined;
      };

      return users.map((u: any) => {
        const id = toId(u._id) || toId(u.id) || undefined;
        const firstName = u.firstName || u.name || '';
        const lastName = u.lastName || '';
        const name = `${firstName}${lastName ? ' ' + lastName : ''}`.trim() || '';

        // Determine role if backend provides roleName; otherwise fallback to 'visitor'
        let role = 'visitor';
        try {
          if (u?.userTypeId) {
            if (typeof u.userTypeId === 'object') {
              if (u.userTypeId.roleName) role = u.userTypeId.roleName;
              // if it's an object with $oid we can't infer role name here
            } else if (typeof u.userTypeId === 'string') {
              // backend returned plain id string — keep fallback
            }
          } else if (Array.isArray(u?.userTypeIds) && u.userTypeIds.length > 0) {
            const first = u.userTypeIds[0];
            if (first?.roleName) role = first.roleName;
          }
        } catch (e) {
          role = 'visitor';
        }

        const lastLogin = parseDate(u.lastLogin) || parseDate(u.updatedAt) || parseDate(u.createdAt);

        return {
          id,
          name,
          email: u.email,
          role,
          status: u.isActive === false ? 'inactive' : 'active',
          lastLogin,
        } as any;
      });
    } catch (error) {
      throw {
        message: 'Failed to fetch users.',
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }

  async updateUser(id: string, input: any) {
    const mutation = gqlUpdateUser;
    const variables = { id, input };
    try {
      const result = await this._client.GraphqlMutate(mutation, variables);
      return result?.updateUser;
    } catch (error) {
      throw {
        message: 'Failed to update user.',
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  async deleteUser(id: string) {
    const mutation = gqlDeleteUser;
    const variables = { id };
    try {
      const result = await this._client.GraphqlMutate(mutation, variables);
      return result?.deleteUser;
    } catch (error) {
      throw {
        message: 'Failed to delete user.',
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }
}
