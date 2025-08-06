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
            followUpStage
            columnSize
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
  }
`;

export const gqlGetAllDashboard = gql`
  query getAllDashboards($filter: DashboardFilterInput) {
    getAllDashboards(filter: $filter) {
      data {
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
            followUpStage
            widgetSubType
            columnSize
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





