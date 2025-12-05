import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  try {
    const settings = await prisma.scrollTopSettings.findUnique({
      where: { shop: session.shop },
    });

    if (!settings) {
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
    }

    return Response.json({
      bgColor: settings.bgColor,
      hoverColor: settings.hoverColor,
      iconColor: settings.iconColor,
      buttonShape: settings.buttonShape,
      buttonPosition: settings.buttonPosition,
      showOnHome: settings.showOnHome,
      showOnProduct: settings.showOnProduct,
      showOnCollection: settings.showOnCollection,
      showOnAll: settings.showOnAll,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
