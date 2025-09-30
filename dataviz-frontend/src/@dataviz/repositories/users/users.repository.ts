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
import { gqlGetAllUserType } from '@dataviz/graphql/queries/users/users.query';
import { gqlGetOneUser } from '@dataviz/graphql/queries/users/users.query';

export class UsersRepository {
  _client = inject(GraphqlClient);

  constructor() {}

  /**
   * Extract a meaningful message and a normalized code from GraphQL/Apollo style errors
   */
  private extractGraphQLErrorInfo(err: any): { code: string; message: string } {
    const pick = (...vals: any[]) => vals.find((v) => typeof v === 'string' && v.trim().length > 0);

    // Try to locate GraphQL errors array from various wrappers
    const graphQLErrors =
      err?.graphQLErrors ||
      err?.networkError?.result?.errors ||
      err?.originalError?.graphQLErrors ||
      err?.originalError?.error?.graphQLErrors ||
      err?.originalError?.errors ||
      err?.errors ||
      err?.response?.errors ||
      err?.originalError?.networkError?.result?.errors ||
      err?.networkError?.result?.errors ||
      [];

    const firstGQLError = Array.isArray(graphQLErrors) && graphQLErrors.length > 0 ? graphQLErrors[0] : undefined;
    const nestedMessage = pick(
      firstGQLError?.message,
      err?.originalError?.message,
      err?.originalError?.networkError?.message,
      err?.originalError?.networkError?.result?.errors?.[0]?.message,
      err?.message,
    );
    const rawMessage = (nestedMessage || '').toString();

    const extensions = firstGQLError?.extensions || err?.originalError?.extensions || err?.extensions || {};
    const stack = (extensions?.stacktrace || []).join(' ') || '';
    const status = extensions?.status;
    const text = `${err?.message || ''} ${err?.originalError?.message || ''} ${rawMessage} ${stack} ${JSON.stringify(err?.originalError || {})}`.toLowerCase();

    // As a last resort, deep-scan object for any string containing our target phrases
    const deepScanFor = (needle: RegExp): boolean => {
      const seen = new Set<any>();
      const stackArr: any[] = [err, err?.originalError];
      while (stackArr.length) {
        const cur = stackArr.pop();
        if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
        seen.add(cur);
        for (const k of Object.keys(cur)) {
          const v: any = (cur as any)[k];
          if (typeof v === 'string' && needle.test(v.toLowerCase())) return true;
          if (v && typeof v === 'object') stackArr.push(v);
        }
      }
      return false;
    };

    // Normalize common backend duplicates for email-in-use
    const isEmailInUse =
      /email\s+already\s+in\s+use/.test(text) ||
      (/duplicate key|e11000/.test(text) && /email/.test(text)) ||
      status === 409 ||
      /conflictexception/.test(text) ||
      deepScanFor(/email\s+already\s+in\s+use/);

    if (isEmailInUse) {
      return { code: 'EMAIL_ALREADY_IN_USE', message: rawMessage || 'Email already in use' };
    }

    return { code: 'USER_CREATE_FAILED', message: rawMessage || 'Failed to create user.' };
  }

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
      const info = this.extractGraphQLErrorInfo(error);
      throw {
        code: info.code,
        message: info.message,
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
        message: 'Failed to login.',
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

  async getAllUserTypes() {
    const query = gqlGetAllUserType;
    try {
      const result = await this._client.GraphqlQuery(query, {} as any);
      const types = result?.getAllUserType?.data || [];
      return types.map((t: any) => ({ id: t._id, roleName: t.roleName }));
    } catch (error) {
      throw {
        message: 'Failed to fetch user types.',
        originalError: error,
        queryOrMutation: query,
      };
    }
  }

  async getOneUser(id: string) {
    const query = gqlGetOneUser;
    const variables = { id };
    try {
      const result = await this._client.GraphqlQuery(query, variables);
      return result?.getOneUser || null;
    } catch (error) {
      throw {
        message: 'Failed to fetch one user.',
        originalError: error,
        queryOrMutation: query,
        input: JSON.stringify(variables),
      };
    }
  }

  async updateUser(id: string, input: any) {
    const mutation = gqlUpdateUser;
    // Ensure required fields exist: if missing name, roleName, or userTypeIds, fetch current record and merge
    let finalInput = { ...input };
    if (!finalInput.name || !finalInput.roleName || !finalInput.userTypeIds) {
      try {
        const existing = await this.getOneUser(id);
        if (existing) {
          finalInput = {
            name: finalInput.name || existing.name || `${existing.firstName || ''}${existing.lastName ? ' ' + existing.lastName : ''}`.trim(),
            roleName: finalInput.roleName || existing.roleName || (Array.isArray(existing.userTypeIds) && existing.userTypeIds[0]?.roleName) || undefined,
            // ensure userTypeIds is present when backend expects it
            userTypeIds: finalInput.userTypeIds || (existing.userTypeIds ? existing.userTypeIds.map((t: any) => (t._id || t)) : undefined) || undefined,
            ...finalInput,
          };

          // Ensure firstName and lastName fields exist for validation
          if (!finalInput.firstName || finalInput.firstName === '') {
            const parts = (finalInput.name || '').split(' ').filter(Boolean);
            finalInput.firstName = parts.shift() || existing.firstName || '';
            finalInput.lastName = finalInput.lastName || parts.join(' ') || existing.lastName || '';
          } else if (!finalInput.lastName) {
            finalInput.lastName = existing.lastName || '';
          }
        }
      } catch (e) {
        // ignore — we'll try update with provided input and let server respond
      }
    }

    const variables = { id, input: finalInput };
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
    } catch (error: any) {
      // If backend doesn't expose deleteUser mutation (validation failed), fallback to soft-delete via updateUser
      const msg = (error?.message || error?.originalError?.message || '').toString();
      if (msg.includes('Cannot query field "deleteUser"') || (error?.extensions && error.extensions.code === 'GRAPHQL_VALIDATION_FAILED')) {
        try {
          const updateMutation = gqlUpdateUser;
          const updateVars = { id, input: { isActive: false } };
          const updateResult = await this._client.GraphqlMutate(updateMutation, updateVars);
          return updateResult?.updateUser || true;
        } catch (uerr) {
          throw {
            message: 'Failed to soft-delete user via updateUser fallback.',
            originalError: uerr,
            queryOrMutation: gqlUpdateUser,
            input: JSON.stringify({ id, input: { isActive: false } }),
          };
        }
      }

      throw {
        message: 'Failed to delete user.',
        originalError: error,
        queryOrMutation: mutation,
        input: JSON.stringify(variables),
      };
    }
  }

  /**
   * Toggle user active status. If backend has a direct toggle, use it; otherwise use updateUser.
   */
  async toggleUserStatus(id: string) {
    try {
      const users = await this.getAllUsers();
      const u = users.find((x: any) => x.id === id);
      if (!u) throw new Error('User not found');

      const newIsActive = !(u.status === 'active');
      // call updateUser to set isActive flag — include required roleName and userTypeIds if available
      const updatePayload: any = { isActive: newIsActive };
      // include name (required by backend) preferably from mapped user, fallback to first/last
      updatePayload.name = u.name || `${u.firstName || ''}${u.lastName ? ' ' + u.lastName : ''}`.trim();
      // backend requires roleName in UpdateUserInput; provide current role if available
      if (u.role) updatePayload.roleName = u.role;
      // if repository getAllUsers included userTypeIds raw, include them; otherwise leave out
      if ((u as any).userTypeIds) updatePayload.userTypeIds = (u as any).userTypeIds;

      const result = await this.updateUser(id, updatePayload);

      const updatedRaw = result?.updateUser || result || {};

      const toId = (val: any) => {
        if (!val) return undefined;
        if (typeof val === 'string') return val;
        if (val.$oid) return val.$oid;
        if (val._id) return val._id;
        return undefined;
      };

      const updated = {
        id: toId(updatedRaw._id) || id,
        name: updatedRaw.name || `${updatedRaw.firstName || ''}${updatedRaw.lastName ? ' ' + updatedRaw.lastName : ''}`.trim(),
        email: updatedRaw.email,
        role: updatedRaw.roleName || (Array.isArray(updatedRaw.userTypeIds) && updatedRaw.userTypeIds[0]?.roleName) || u.role,
        status: updatedRaw.isActive === false ? 'inactive' : 'active'
      } as any;

      return updated;
    } catch (error) {
      throw {
        message: 'Failed to toggle user status.',
        originalError: error,
      };
    }
  }
}
