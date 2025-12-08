export const GET_SHOP_THEMES = `#graphql
      query GetShopThemes{
        themes(first: 20) {
          edges {
            node {
              id
              role
              name
            }
          }
        }
      }`;
