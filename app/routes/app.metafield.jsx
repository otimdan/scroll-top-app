import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import { GET_SHOP_ID } from "../graphql/queries/getShopId.js";
import { GET_METAFIELD_DEFINITIONS } from "../graphql/queries/getMetafieldDefinitions.js";
import { CREATE_SHOP_METAFIELD } from "../graphql/mutations/createShopMetafield.js";
import { SET_SHOP_METAFIELD } from "../graphql/mutations/setShopMetafield.js";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // Shop Id
  const shopResponse = await admin.graphql(GET_SHOP_ID);
  const shopJson = await shopResponse.json();
  console.log("Shop ID:", shopJson.data.shop.id);

  //Fetch metafield definitions
  const MetaFieldresponse = await admin.graphql(GET_METAFIELD_DEFINITIONS, {
    variables: {
      ownerType: "SHOP",
      first: 250,
    },
  });
  const json = await MetaFieldresponse.json();
  //   Check if "scrolling_settings" metafield definition exists
  const metafieldExists = json.data?.metafieldDefinitions?.nodes;
  const exists = metafieldExists.some(
    (definition) => definition.name === "scrolling_settings",
  );

  if (exists) {
    console.log("scrolling_settings exists");
  } else {
    console.log("scrolling_settings does NOT exist");
  }

  //   define a metafield
  const DefineMetafieldresponse = await admin.graphql(CREATE_SHOP_METAFIELD, {
    variables: {
      definition: {
        name: "Example Metafield",
        namespace: "example_namespace",
        key: "example_key",
        description: "Dummy metafield definition for name",
        type: "json",
        ownerType: "SHOP",
      },
    },
  });
  const defineMetafieldjson = await DefineMetafieldresponse.json();
  console.log("Define Metafield Response:", defineMetafieldjson.data);

  const trialData = {
    bgColor: "#da7a20ff",
    hoverColor: "#d42d89ff",
    iconColor: "#6dcfe1ff",
    buttonShape: "circle",
    buttonPosition: "right",
    showOnHome: false,
    showOnProduct: false,
    showOnCollection: false,
    showOnAll: true,
  };

  const SetMetafieldresponse = await admin.graphql(SET_SHOP_METAFIELD, {
    variables: {
      metafields: [
        {
          key: "example_key",
          namespace: "example_namespace",
          ownerId: shopJson.data.shop.id,
          type: "json",
          value: JSON.stringify(trialData),
        },
      ],
    },
  });
  const SetMetafieldjson = await SetMetafieldresponse.json();
  console.log("Set Metafield Response:", SetMetafieldjson.data.metafieldsSet);

  return json.data.metafieldDefinitions.nodes;
};

export async function action({ request }) {
  await authenticate.admin(request);

  return null;
}

export default function MetafieldPage() {
  const data = useLoaderData();
  console.log(data);
  return (
    <div>
      <h1>Metafield Definitions</h1>
    </div>
  );
}
