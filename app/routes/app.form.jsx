import { useState, useEffect } from "react";
import { useSubmit, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    // Check if settings metafield exists
    const checkResponse = await admin.graphql(`
      query GetShopMetafield {
        shop {
          scrollTopSettings: metafield(namespace: "scroll_top_app", key: "settings") {
            id
          }
        }
      }
    `);

    const checkResult = await checkResponse.json();
    const metafieldExists = checkResult.data?.shop?.scrollTopSettings?.id;

    // If no metafield exists, create default settings
    if (!metafieldExists) {
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

      await admin.graphql(
        `
        mutation SetShopMetafield($input: ShopMetafieldsSetInput!) {
          shopMetafieldsSet(input: $input) {
            metafields {
              id
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

      console.log("Default settings created for shop:", session.shop);
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
  }

  return null;
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
      bgColor: formData.get("bg_color") || "#28A745",
      hoverColor: formData.get("hover_color") || "#1C7530",
      iconColor: formData.get("icon_color") || "#FFFFFF",
      buttonShape: formData.get("button_shape") || "circle",
      buttonPosition: formData.get("button_position") || "right",
      showOnHome: formData.get("show_on_home") === "true",
      showOnProduct: formData.get("show_on_product") === "true",
      showOnCollection: formData.get("show_on_collection") === "true",
      showOnAll: formData.get("show_on_all") === "true",
    };

    // Save to shop metafield
    const response = await admin.graphql(
      `
      mutation SetShopMetafield($input: ShopMetafieldsSetInput!) {
        shopMetafieldsSet(input: $input) {
          metafields {
            id
            key
            namespace
            value
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
                value: JSON.stringify(settingsData),
              },
            ],
          },
        },
      },
    );

    const result = await response.json();
    console.log("Metafield save response:", result);

    if (result.data?.shopMetafieldsSet?.userErrors?.length > 0) {
      return {
        success: false,
        message: result.data.shopMetafieldsSet.userErrors[0].message,
      };
    }

    // Also save to database for backup/reporting
    const settings = await prisma.scrollTopSettings.upsert({
      where: { shop: session.shop },
      update: {
        bgColor: settingsData.bgColor,
        hoverColor: settingsData.hoverColor,
        iconColor: settingsData.iconColor,
        buttonShape: settingsData.buttonShape,
        buttonPosition: settingsData.buttonPosition,
        showOnHome: settingsData.showOnHome,
        showOnProduct: settingsData.showOnProduct,
        showOnCollection: settingsData.showOnCollection,
        showOnAll: settingsData.showOnAll,
      },
      create: {
        shop: session.shop,
        bgColor: settingsData.bgColor,
        hoverColor: settingsData.hoverColor,
        iconColor: settingsData.iconColor,
        buttonShape: settingsData.buttonShape,
        buttonPosition: settingsData.buttonPosition,
        showOnHome: settingsData.showOnHome,
        showOnProduct: settingsData.showOnProduct,
        showOnCollection: settingsData.showOnCollection,
        showOnAll: settingsData.showOnAll,
      },
    });

    console.log(
      "Settings saved to metafield and database for shop:",
      session.shop,
      settingsData,
    );
    return { success: true, message: "Settings saved successfully!" };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, message: "Failed to save settings" };
  }
}

export default function AdditionalPage() {
  const submit = useSubmit();
  const actionData = useActionData();
  const [formState, setFormState] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [switches, setSwitches] = useState({
    show_on_home: false,
    show_on_product: false,
    show_on_collection: false,
    show_on_all: true,
  });
  const [selects, setSelects] = useState({
    button_shape: "circle",
    button_position: "right",
  });

  useEffect(() => {
    if (actionData?.success) {
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [actionData]);

  function handleSave(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("color", formState.color || "");
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
      color: formState.color,
      bg_color: formState.bg_color,
      hover_color: formState.hover_color,
      icon_color: formState.icon_color,
      ...switches,
      ...selects,
    });

    setSuccessMessage("Saving settings...");
    submit(formData, { method: "post" });
  }

  return (
    <s-page heading="Form page">
      <s-section>
        {successMessage && (
          <s-banner tone="success" title="Success">
            {successMessage}
          </s-banner>
        )}
        <form onSubmit={handleSave}>
          <s-stack direction="inline" gap="base small">
            <s-stack>
              <s-text-field
                label="color"
                name="color"
                value={formState.color}
                onInput={(e) =>
                  setFormState({ ...formState, color: e.target.value })
                }
              />
            </s-stack>
          </s-stack>
          <s-color-field
            label="Button Background Color"
            placeholder="#28A745"
            name="bg-color"
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
            placeholder="#1C7530"
            name="hover-color"
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
            placeholder="#1C7530"
            name="icon-color"
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
          <s-button type="submit" variant="primary">
            Save
          </s-button>
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
              ↑
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
