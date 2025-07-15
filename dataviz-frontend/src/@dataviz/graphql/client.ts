import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';

@Injectable({
    providedIn: 'root',
})
export class GraphqlClient {
    constructor(private apollo: Apollo) {}

    /**
     * Executes a GraphQL mutation.
     * @param mutation - The GraphQL mutation document.
     * @param variables - The variables for the mutation.
     * @returns A Promise of the mutation result.
     */
    async GraphqlMutate(mutation: any, variables: Object): Promise<any> {
        if (!mutation) {
            throw new Error('Mutation is required.');
        }

        try {
            const result = await this.apollo
                .mutate<any>({
                    mutation,
                    variables,
                })
                .toPromise();
            return result?.data; // Adjust based on your API response
        } catch (error) {
            throw {
                message: `Failed to process the mutation request: ${mutation?.definitions?.[0]?.name?.value}`,
                originalError: error,
                queryOrMutation: mutation.loc?.source.body,
                input: JSON.stringify(variables),
            };
        }
    }

    /**
     * Executes a GraphQL mutation with an optional multipart context for file uploads.
     * @param mutation - The GraphQL mutation document.
     * @param variables - The variables for the mutation.
     * @param isUseMultipart - A boolean indicating whether to use multipart context for file uploads. Default is false.
     * @returns A Promise of the mutation result.
     */
    async GraphqlMutateWithContext(
        mutation: any,
        variables: Object,
        isUseMultipart: boolean = false
    ): Promise<any> {
        if (!mutation) {
            throw new Error('Mutation is required.');
        }

        try {
            const result = await this.apollo
                .mutate<any>({
                    mutation,
                    variables,
                    context: isUseMultipart
                        ? {
                              useMultipart: true, // Adds multipart context if true
                              headers: {
                                  'apollo-require-preflight': true,
                              },
                          }
                        : {
                              headers: {
                                  'apollo-require-preflight': true,
                              },
                          },
                })
                .toPromise();

            return result?.data; // Adjust based on your API response
        } catch (error) {
            throw {
                message: `Failed to process the mutation request: ${mutation?.definitions?.[0]?.name?.value}`,
                originalError: error,
                queryOrMutation: mutation.loc?.source.body,
                input: JSON.stringify(variables),
                isUseMultipart, // Include this to track if multipart was used
            };
        }
    }

    /**
     * Executes a GraphQL query.
     * @param query - The GraphQL query document.
     * @param variables - The variables for the query.
     * @returns A Promise of the query result.
     */
    async GraphqlQuery(query: any, variables: Object): Promise<any> {
        if (!query) {
            throw new Error('Query is required.');
        }

        try {
            const result = await this.apollo
                .query<any>({
                    query,
                    variables,
                    fetchPolicy: 'network-only',
                })
                .toPromise();
            return result?.data; // Adjust based on your API response
        } catch (error) {
            throw {
                message: `Failed to process the query request: ${query?.definitions?.[0]?.name?.value}`,
                originalError: error,
                queryOrMutation: query.loc?.source.body,
                input: JSON.stringify(variables),
            };
        }
    }

    /**
     * Example method to demonstrate calling GraphqlMutate and GraphqlQuery.
     */
    async exampleMethod() {
        const mutation = ''; /* GraphQL mutation document */
        const query = ''; /* GraphQL query document */
        const variables = {
            /* variables for mutation and query */
        };

        try {
            const mutationResult = await this.GraphqlMutate(
                mutation,
                variables
            );

            const queryResult = await this.GraphqlQuery(query, variables);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}
