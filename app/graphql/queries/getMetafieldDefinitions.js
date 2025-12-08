export const GET_METAFIELD_DEFINITIONS = `#graphql
  query MetafieldDefinitions($ownerType: MetafieldOwnerType!, $first: Int) {
    metafieldDefinitions(ownerType: $ownerType, first: $first) {
      nodes {
        name
        namespace
        key
        type {
          name
        }
      }
    }
  }`;
