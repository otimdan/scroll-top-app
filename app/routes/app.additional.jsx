import { useState, useEffect } from "react";
import { useSubmit, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { GET_METAFIELD_DEFINITIONS } from "../graphql/queries/getMetafieldDefinitions.js";
import { GET_METAFIELD_DEFINITION } from "../graphql/queries/getMetafieldDefinition.js";
import { CREATE_SHOP_METAFIELD } from "../graphql/mutations/createShopMetafield.js";
import { SET_SHOP_METAFIELD } from "../graphql/mutations/setShopMetafield.js";
import { GET_SHOP_ID } from "../graphql/queries/getShopId.js";

import { isAppEmbedActive } from "../helpers/isAppEmbedActive.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const appEmbedActive = await isAppEmbedActive(admin);

  try {
    // Check if settings metafield exists
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

    // If no metafield exists, create default settings
    if (!exists) {
      //   define a metafield
      const DefineMetafieldresponse = await admin.graphql(
        CREATE_SHOP_METAFIELD,
        {
          variables: {
            definition: {
              name: "scrolling_settings",
              namespace: "scrolling",
              key: "scrolling_test",
              description: "Dummy metafield definition for name",
              type: "json",
              ownerType: "SHOP",
            },
          },
        },
      );

      const defineMetafieldjson = await DefineMetafieldresponse.json();
      console.log("Define Metafield Response:", defineMetafieldjson.data);

      // Set metafield data
      const defaultSettings = {
        bgColor: "#222222",
        hoverColor: "#635b5b",
        iconColor: "#FFFFFF",
        buttonShape: "circle",
        buttonPosition: "right",
        showOnHome: false,
        showOnProduct: false,
        showOnCollection: false,
        showOnAll: true,
      };

      // Shop Id
      const shopResponse = await admin.graphql(GET_SHOP_ID);
      const shopJson = await shopResponse.json();
      console.log("Shop ID:", shopJson.data.shop.id);

      const SetMetafieldresponse = await admin.graphql(SET_SHOP_METAFIELD, {
        variables: {
          metafields: [
            {
              key: "scrolling_test",
              namespace: "scrolling",
              ownerId: shopJson.data.shop.id,
              type: "json",
              value: JSON.stringify(defaultSettings),
            },
          ],
        },
      });
      const SetMetafieldjson = await SetMetafieldresponse.json();
      console.log(
        "Set Metafield Response:",
        SetMetafieldjson.data.metafieldsSet,
      );
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
  }

  // Data to fill in form as placeholder
  // This takes any metafield value available whether on fresh start or already avaible and just here for editing existing
  const GetMetafieldValue = await admin.graphql(GET_METAFIELD_DEFINITION, {
    variables: {
      first: 5,
      identifier: {
        ownerType: "SHOP",
        namespace: "scrolling",
        key: "scrolling_test",
      },
    },
  });
  const metafieldJson = await GetMetafieldValue.json();
  // Remember value is returned as a string regardless of type
  const metafieldValue =
    metafieldJson.data.metafieldDefinition.metafields.nodes[0].value;
  // Turn metafield value from string to object
  const settings = JSON.parse(metafieldValue);

  return { shop: session.shop, appEmbedActive, settings };
};

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return { error: "Invalid request method" };
  }

  const formData = await request.formData();

  try {
    // Prepare metafield data with all settings
    const settingsData = {
      bgColor: formData.get("bg_color") || "#222222",
      hoverColor: formData.get("hover_color") || "#635b5b",
      iconColor: formData.get("icon_color") || "#FFFFFF",
      buttonShape: formData.get("button_shape") || "circle",
      buttonPosition: formData.get("button_position") || "right",
      showOnHome: formData.get("show_on_home") === "true",
      showOnProduct: formData.get("show_on_product") === "true",
      showOnCollection: formData.get("show_on_collection") === "true",
      showOnAll: formData.get("show_on_all") === "true",
    };

    // Shop Id
    const shopResponse = await admin.graphql(GET_SHOP_ID);
    const shopJson = await shopResponse.json();
    console.log("Shop ID:", shopJson.data.shop.id);
    // Save to shop metafield
    const response = await admin.graphql(SET_SHOP_METAFIELD, {
      variables: {
        metafields: [
          {
            key: "scrolling_test",
            namespace: "scrolling",
            ownerId: shopJson.data.shop.id,
            type: "json",
            value: JSON.stringify(settingsData),
          },
        ],
      },
    });

    const result = await response.json();
    console.log("Metafield save response:", result.data.metafieldsSet);

    console.log(
      "Settings saved to metafield and database for shop:",
      session.shop,
      settingsData,
    );
    return { success: true, message: "Settings saved successfully!" };
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

export default function AdditionalPage() {
  const { shop, appEmbedActive, settings } = useLoaderData();
  const shopify = useAppBridge();
  const submit = useSubmit();
  console.log("Loaded settings:", settings);
  const actionData = useActionData();
  // Initialize state from loaded settings with proper mapping
  const [formState, setFormState] = useState({
    bg_color: settings?.bgColor || "#222222",
    hover_color: settings?.hoverColor || "#635b5b",
    icon_color: settings?.iconColor || "#FFFFFF",
  });
  console.log("Form state initialized to:", formState);
  const [error, setError] = useState("");
  const [switches, setSwitches] = useState({
    show_on_home: settings?.showOnHome || false,
    show_on_product: settings?.showOnProduct || false,
    show_on_collection: settings?.showOnCollection || false,
    show_on_all: settings?.showOnAll || true,
  });

  const [selects, setSelects] = useState({
    button_shape: settings?.buttonShape || "circle",
    button_position: settings?.buttonPosition || "right",
  });

  // Update state when settings change (e.g., after navigation)
  useEffect(() => {
    if (settings) {
      setFormState({
        bg_color: settings.bgColor || "#222222",
        hover_color: settings.hoverColor || "#635b5b",
        icon_color: settings.iconColor || "#FFFFFF",
      });
      setSwitches({
        show_on_home: settings.showOnHome || false,
        show_on_product: settings.showOnProduct || false,
        show_on_collection: settings.showOnCollection || false,
        show_on_all: settings.showOnAll || true,
      });
      setSelects({
        button_shape: settings.buttonShape || "circle",
        button_position: settings.buttonPosition || "right",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Settings saved successfully!", {
        duration: 3000,
      });
    } else if (actionData?.error) {
      shopify.toast.show(actionData.error, {
        duration: 3000,
        isError: true,
      });
    }
  }, [actionData, shopify]);

  function handleSave(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bg_color", formState.bg_color || "");
    formData.append("hover_color", formState.hover_color || "");
    formData.append("icon_color", formState.icon_color || "");
    formData.append("show_on_home", switches.show_on_home);
    formData.append("show_on_product", switches.show_on_product);
    formData.append("show_on_collection", switches.show_on_collection);
    formData.append("show_on_all", switches.show_on_all);
    formData.append("button_shape", selects.button_shape);
    formData.append("button_position", selects.button_position);

    console.log("Form data being submitted:", {
      bg_color: formState.bg_color,
      hover_color: formState.hover_color,
      icon_color: formState.icon_color,
      ...switches,
      ...selects,
    });

    submit(formData, { method: "post" });
  }
  return (
    <s-page heading="Additional page">
      {!appEmbedActive && (
        <s-banner tone="warning" title="Block Not Activated">
          Please add and enable the Scroll to Top block in your theme to display
          the button on your storefront.
        </s-banner>
      )}
      {appEmbedActive && (
        <s-banner tone="success" title="Block Active">
          Your scroll-to-top block is active on the storefront!
        </s-banner>
      )}
      {/* Setup Guide */}
      <s-section>
        <s-heading>Gettings Started</s-heading>
        <s-stack gap="large">
          <s-stack direction="inline" justifyContent="start" gap="small-300">
            {appEmbedActive ? (
              <s-icon type="check-circle-filled" />
            ) : (
              <s-icon type="circle-dashed" />
            )}
            <s-stack direction="block" gap="small-500">
              <s-heading>Activate App Embed</s-heading>
              <s-paragraph>
                Enable Scroll Top App Embed from your theme&apos;s settings.
              </s-paragraph>
              <s-button
                onClick={() => {
                  window.open(
                    `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=8dddd8c19bacd4578a464f9d361c9477/scroll-to-top`,
                  );
                }}
              >
                Activate App Embed
              </s-button>
            </s-stack>
          </s-stack>
          <s-stack gap="small-300" direction="inline" justifyContent="start">
            <s-icon type="circle-dashed" />
            <s-stack direction="block" gap="small-500">
              <s-heading>Edit Scroll Top App settings</s-heading>
              <s-paragraph>
                Use the controls below to set your button&apos;s primary colors
                and styles.
              </s-paragraph>
            </s-stack>
          </s-stack>
        </s-stack>
      </s-section>

      {/* Settings Form */}
      <s-section>
        <form onSubmit={handleSave} data-save-bar>
          <s-stack gap="base large">
            <s-color-field
              label="Button Background Color"
              placeholder={formState.bg_color}
              name="bg_color"
              value={formState.bg_color}
              error={error}
              onChange={(e) => {
                const newColor = e.currentTarget.value;
                console.log("Bg changed to:", newColor);
                setFormState({ ...formState, bg_color: newColor });
                setError(
                  /^#([0-9A-F]{3}){1,2}$/i.test(newColor)
                    ? ""
                    : "Please enter a valid color format",
                );
              }}
            />
            <s-color-field
              label="Button Hover Color"
              placeholder={formState.hover_color}
              name="hover_color"
              value={formState.hover_color}
              error={error}
              onChange={(e) => {
                const newColor = e.currentTarget.value;
                console.log("Hover changed to:", newColor);
                setFormState({ ...formState, hover_color: newColor });
                setError(
                  /^#([0-9A-F]{3}){1,2}$/i.test(newColor)
                    ? ""
                    : "Please enter a valid color format",
                );
              }}
            />
            <s-color-field
              label="Button Icon Color"
              placeholder={formState.icon_color}
              name="icon_color"
              value={formState.icon_color}
              error={error}
              onChange={(e) => {
                const newColor = e.currentTarget.value;
                console.log("Icon changed to:", newColor);
                setFormState({ ...formState, icon_color: newColor });
                setError(
                  /^#([0-9A-F]{3}){1,2}$/i.test(newColor)
                    ? ""
                    : "Please enter a valid color format",
                );
              }}
            />
            <s-stack gap="small-200">
              <s-switch
                id="show-on-home"
                label="Show on Home Page"
                checked={switches.show_on_home}
                onChange={(e) =>
                  setSwitches({
                    ...switches,
                    show_on_home: e.currentTarget.checked,
                  })
                }
              />
              <s-switch
                id="show-on-product"
                label="Show on Product Page"
                checked={switches.show_on_product}
                onChange={(e) =>
                  setSwitches({
                    ...switches,
                    show_on_product: e.currentTarget.checked,
                  })
                }
              />
              <s-switch
                id="show-on-collection"
                label="Show on Collection Page"
                checked={switches.show_on_collection}
                onChange={(e) =>
                  setSwitches({
                    ...switches,
                    show_on_collection: e.currentTarget.checked,
                  })
                }
              />
              <s-switch
                id="show-on-all"
                label="Show on All Pages"
                checked={switches.show_on_all}
                onChange={(e) =>
                  setSwitches({
                    ...switches,
                    show_on_all: e.currentTarget.checked,
                  })
                }
              />
            </s-stack>
            <s-select
              label="Button Shape"
              value={selects.button_shape}
              onChange={(e) =>
                setSelects({
                  ...selects,
                  button_shape: e.currentTarget.value,
                })
              }
            >
              <s-option value="circle">Circle</s-option>
              <s-option value="square">Square</s-option>
            </s-select>
            <s-select
              label="Button Position"
              value={selects.button_position}
              onChange={(e) =>
                setSelects({
                  ...selects,
                  button_position: e.currentTarget.value,
                })
              }
            >
              <s-option value="right">Right</s-option>
              <s-option value="left">Left</s-option>
            </s-select>
          </s-stack>
        </form>
      </s-section>
      <s-box slot="aside">
        {/* === */}
        {/* Live Preview */}
        {/* === */}
        <s-section heading="Live Preview">
          <s-stack gap="base" justifyContent="center">
            <s-text>Button Preview</s-text>
            <button
              style={{
                backgroundColor: formState.bg_color || "#28A745",
                color: formState.icon_color || "#FFFFFF",
                padding: "12px 24px",
                border: "none",
                borderRadius: selects.button_shape === "circle" ? "50%" : "4px",
                cursor: "pointer",
                width: selects.button_shape === "circle" ? "60px" : "auto",
                height: selects.button_shape === "circle" ? "60px" : "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                transition: "all 0.3s ease",
                position:
                  selects.button_position === "left"
                    ? "flex-start"
                    : "flex-end",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  formState.hover_color || "#1C7530";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  formState.bg_color || "#28A745";
              }}
            >
              <svg
                style={{
                  width: "3em",
                  height: "3em",
                  verticalAlign: "-0.125em",
                  fill: formState.icon_color || "#FFFFFF",
                }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z" />
              </svg>
            </button>
            <s-divider />
            <s-stack direction="column" gap="small">
              <s-text>
                <strong>Settings:</strong>
              </s-text>
              <s-text>Shape: {selects.button_shape}</s-text>
              <s-text>Position: {selects.button_position}</s-text>
              <s-text>BG Color: {formState.bg_color || "#28A745"}</s-text>
              <s-text>Hover Color: {formState.hover_color || "#1C7530"}</s-text>
              <s-text>Icon Color: {formState.icon_color || "#FFFFFF"}</s-text>
              <s-text>
                Pages:{" "}
                {[
                  switches.show_on_home && "Home",
                  switches.show_on_product && "Product",
                  switches.show_on_collection && "Collection",
                  switches.show_on_all && "All",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </s-text>
            </s-stack>
          </s-stack>
        </s-section>
      </s-box>
    </s-page>
  );
}
