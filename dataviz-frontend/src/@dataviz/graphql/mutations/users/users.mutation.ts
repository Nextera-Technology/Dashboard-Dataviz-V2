import { gql } from "@apollo/client/core";

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
      email
      firstName
      lastName
      name
      isActive
      status
      userTypeIds {
        _id
        roleName
      }
    }
  }
`;

export const gqlLogin = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        _id
        email
        firstName
        isActive
        isEmailVerified
        lastName
        name
        phoneNumber
        profilePicture
        status
        userTypeIds {
          _id
          roleName
        }
      }
    }
  }
`;
