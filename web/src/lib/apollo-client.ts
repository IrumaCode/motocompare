import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// The normalized cache stores each object once by __typename + id, so a motorcycle loaded
// in the catalog is reused by the detail and comparison pages
export function createApolloClient(uri: string): ApolloClient {
  return new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
  });
}
