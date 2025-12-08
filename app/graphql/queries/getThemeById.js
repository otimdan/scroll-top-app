export const GET_THEME_BY_ID = `#graphql
        query getThemeFile($id: ID!) {
            theme(id: $id) {
            files(filenames: ["config/settings_data.json"], first: 1) {
                nodes {
                filename
                body {
                    ... on OnlineStoreThemeFileBodyText {
                    content
                    }
                }
                }
            }
            }
        }`;
