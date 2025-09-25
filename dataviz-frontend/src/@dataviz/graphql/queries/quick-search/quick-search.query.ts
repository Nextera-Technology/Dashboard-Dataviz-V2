import { gql } from '@apollo/client/core';

export const QUICK_SEARCH_QUERY = gql`
  query quickSearch($input: QuickSearchInput!) {
    quickSearch(input: $input) {
      totalResults
      results {
        category
        items {
          id
          title
          subtitle
          avatarUrl
          status
          dashboardType
          dashboardName
          parentName
          chartType
          certification
          classes
          school
          roleName
          updatedAt
          isArchived
          widgetType
          widgetSubType
        }
      }
    }
  }
`;

export interface QuickSearchInput {
  categories?: string[] | null;
  limit?: number;
  query: string;
  page?: number;
}

export interface QuickSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  status?: string;
  dashboardType?: string;
  dashboardName?: string;
  parentName?: string;
  chartType?: string;
  certification?: string;
  classes?: string;
  school?: string;
  roleName?: string;
  updatedAt?: string;
  isArchived?: boolean;
  widgetType?: string;
  widgetSubType?: string;
  // Local-only field used by the UI for ALL category rendering
  category?: string;
}

export interface CategoryResult {
  category: string;
  items: QuickSearchResult[];
}

export interface QuickSearchResponse {
  quickSearch: {
    totalResults: number;
    results: CategoryResult[];
  };
}
