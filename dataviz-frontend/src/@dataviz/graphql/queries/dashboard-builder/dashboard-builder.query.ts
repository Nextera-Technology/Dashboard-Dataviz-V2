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

export const gqlGetOneDashboard = gql`
  query GetOneDashboard($id: String!) {
    getOneDashboard(_id: $id) {
      _id
      name
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
    }
  }
`;

export const gqlGetChartOptions = gql`
  query GetChartOptions {
    getChartOptions {
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
  query getDashboardTemplates($type: String!) {
    getDashboardTemplates(type: $type) {
      _id
      name
    }
  }
`;





