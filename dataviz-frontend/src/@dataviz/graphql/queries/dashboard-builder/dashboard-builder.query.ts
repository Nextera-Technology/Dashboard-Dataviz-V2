import { gql } from "@apollo/client/core";

export const gqlGetAllDashboardTable = gql`
  query getAllDashboards(
    $filter: DashboardFilterInput
    $pagination: PaginationDto
  ) {
    getAllDashboards(filter: $filter, pagination: $pagination) {
      data {
        _id
        name
        sources {
          certification
          classes
        }
        title
        status
        duplicationType
        dashboardOriginId {
          _id
          name
          title
          type
        }
      }
    }
  }
`;

export const gqlGetAllDashboard = gql`
  query getAllDashboards($filter: DashboardFilterInput) {
    getAllDashboards(filter: $filter) {
      data {
        _id
        name
        sources {
          certification
          classes
        }
        title
        status
        duplicationType
        dashboardOriginId {
          _id
          name
          title
          type
        }
      }
    }
  }
`;

export const gqlOpenDashboardWithSchoolFilter = gql`
  query openDashboardWithSchoolFilter($dashboardId: String!, $schoolFilters: [String!]!) {
    openDashboardWithSchoolFilter(dashboardId: $dashboardId, schoolFilters: $schoolFilters) {
      _id
      name
      currentSchools
      sectionIds {
        name
        _id
        background
        title
        widgetIds {
          _id
          chartType
          data
          name
          title
          visible
          widgetType
          widgetSubType
          columnSize
          followUpStage
          rowSize
          background
          status
        }
        status
      }
      sources {
        certification
        classes
      }
      title
      status
      typeOfUsage
    }
  }
`;

export const gqlGetOneDashboard = gql`
  query GetOneDashboard($id: String!) {
    getOneDashboard(_id: $id) {
      _id
      name
      currentSchools
      sectionIds {
        name
        _id
        background
        title
        widgetIds {
          _id
          chartType
          data
          name
          title
          visible
          widgetType
          widgetSubType
          columnSize
          followUpStage
          rowSize
          background
          status
        }
        status
      }
      sources {
        certification
        classes
      }
      title
      status
      typeOfUsage
    }
  }
`;

export const gqlGetChartOptions = gql`
  query GetChartOptions($isForJobDescription: Boolean) {
    getChartOptions(isForJobDescription: $isForJobDescription) {
      data {
        chartOptions {
          previewChartImage
          chartType
        }
        defaultChart
        widgetSubType
        widgetType
      }
    }
  }
`;

export const gqlGetDashboardTemplates = gql`
  query getDashboardTemplates($type: String!, $isForJobDescription: Boolean) {
    getDashboardTemplates(type: $type, isForJobDescription: $isForJobDescription) {
      _id
      name
    }
  }
`;

export const gqlGetSchoolDropdown = gql`
  query getSchoolDropdown($dashboardId: String!) {
    getSchoolDropdown(dashboardId: $dashboardId)
  }
`;
