import { graphql } from '../../generated/graphql';

// In a .ts file so the page and its tests share the same documents
// (react-refresh only allows components to be exported from .tsx files)

/** Motorcycles per catalog page (the mocked queries in the tests must use the same value). */
export const CATALOG_PAGE_SIZE = 12;

// Separate from the results query: changing a filter must not refetch the filter options
export const filterOptionsQuery = graphql(`
  query CatalogFilterOptions {
    brands {
      id
      slug
      name
    }
    categories {
      id
      slug
      name
    }
  }
`);

export const catalogQuery = graphql(`
  query CatalogMotorcycles(
    $filter: MotorcycleFilter
    $sort: MotorcycleSort!
    $page: Int!
    $pageSize: Int!
  ) {
    motorcycles(filter: $filter, sort: $sort, page: $page, pageSize: $pageSize) {
      totalCount
      items {
        id
        ...MotorcycleCard
      }
    }
  }
`);
