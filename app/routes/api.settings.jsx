import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  try {
    // Fetch shop metafield
    const response = await admin.graphql(`
      query GetShopMetafield {
        shop {
          scrollTopSettings: metafield(namespace: "scroll_top_app", key: "settings") {
            id
            value
          }
        }
      }
    `);

    const result = await response.json();
    const metafieldValue = result.data?.shop?.scrollTopSettings?.value;

    if (metafieldValue) {
      return Response.json(JSON.parse(metafieldValue));
    }

    // Return defaults if no metafield exists
    return Response.json({
      bgColor: "#28A745",
      hoverColor: "#1C7530",
      iconColor: "#FFFFFF",
      buttonShape: "circle",
      buttonPosition: "right",
      showOnHome: false,
      showOnProduct: false,
      showOnCollection: false,
      showOnAll: true,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}
