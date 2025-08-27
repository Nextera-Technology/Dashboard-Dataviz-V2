import { gql } from '@apollo/client/core';

export const gqlGetAllUsers = gql`
    query GetAllUsers(
        $pagination: PaginationDto
        $sorting: UserSortInput
        $filter: UserFilterInput
    ) {
        getAllUser(pagination: $pagination, sort: $sorting, filter: $filter) {
            data {
                _id
                firstName
                lastName
                email
                phoneNumber
                userTypeIds {
                    _id
                    roleName
                }
            }
            totalData
        }
    }
`;

export const gqlGetDropdownUsers = gql`
    query GetDropdownUsers {
        getAllUser {
            data {
                _id
                firstName
                lastName
                email
            }
            totalData
        }
    }
`;

export const gqlGetOneUser = gql`
    query GetOneUser($id: String!) {
        getOneUser(_id: $id) {
            _id
            firstName
            lastName
        }
    }
`;
