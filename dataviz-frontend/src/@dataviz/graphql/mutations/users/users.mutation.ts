import { gql } from '@apollo/client/core';

export const gqlCreateUser = gql`
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            _id
        }
    }
`;

export const gqlDeleteUser = gql`
    mutation DeleteUser($id: String!) {
        deleteUser(_id: $id) {
            _id
        }
    }
`;

export const gqlUpdateUser = gql`
    mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
        updateUser(_id: $id, input: $input) {
            _id
        }
    }
`;
