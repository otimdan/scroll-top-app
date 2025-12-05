import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return { status: 405, body: "Method not allowed" };
  }

  try {
    // Create default settings metafield on app install
    const defaultSettings = {
      bgColor: "#28A745",
      hoverColor: "#1C7530",
      iconColor: "#FFFFFF",
      buttonShape: "circle",
      buttonPosition: "right",
      showOnHome: false,
      showOnProduct: false,
      showOnCollection: false,
      showOnAll: true,
    };

    const response = await admin.graphql(
      `
      mutation SetShopMetafield($input: ShopMetafieldsSetInput!) {
        shopMetafieldsSet(input: $input) {
          metafields {
            id
            key
            namespace
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        variables: {
          input: {
            metafields: [
              {
                namespace: "scroll_top_app",
                key: "settings",
                type: "json",
                value: JSON.stringify(defaultSettings),
              },
            ],
          },
        },
      },
    );

    const result = await response.json();
    console.log("App installed - default settings created:", result);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error creating default settings on install:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
