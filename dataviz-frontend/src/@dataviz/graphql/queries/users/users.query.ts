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
                name
                email
                phoneNumber
                isActive
                roleName
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
            name
            email
            isActive
            roleName
            userTypeIds {
                _id
                roleName
            }
        }
    }
`;

export const gqlGetAllUserType = gql`
    query GetAllUserType {
        getAllUserType {
            data {
                _id
                roleName
            }
        }
    }
`;
