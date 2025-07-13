import { gql } from "@apollo/client/core";

export const gqlCreateDashboard = gql`
  mutation CreateDashboard($input: CreateDashboardInput!) {
    createDashboard(input: $input) {
      _id
    }
  }
`;

export const gqlUpdateDashboard = gql`
  mutation UpdateDashboard($id: String!, $input: UpdateDashboardInput!) {
    updateDashboard(_id: $id, input: $input) {
      _id
    }
  }
`;

export const gqlDeleteDashboard = gql`
  mutation DeleteDashboard($id: String!) {
    DeleteDashboard(_id: $id) {
      _id
    }
  }
`;

export const gqlCreateSection = gql`
  mutation CreateSection($input: CreateSectionInput!) {
    createSection(input: $input) {
      _id
    }
  }
`;

export const gqldeleteSection = gql`
  mutation DeleteSection($id: String!) {
    deleteSection(_id: $id) {
      _id
    }
  }
`;

export const gqlUpdateSection = gql`
  mutation UpdateSection($id: String!, $input: UpdateSectionInput!) {
    updateSection(_id: $id, input: $input) {
      _id
    }
  }
`;

export const gqlCreateWidget = gql`
  mutation CreateWidget($input: CreateWidgetInput!) {
    createWidget(input: $input) {
      _id
    }
  }
`;

export const gqlUpdateWidget = gql`
  mutation UpdateWidget($id: String!, $input: UpdateWidgetInput!) {
    updateWidget(_id: $id, input: $input) {
      _id
    }
  }
`;

export const gqlDeleteWidget = gql`
  mutation DeleteWidget($id: String!) {
    deleteWidget(_id: $id) {
      _id
    }
  }
`;
