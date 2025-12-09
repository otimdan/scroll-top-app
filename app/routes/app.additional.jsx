import { useState } from "react";
// import { useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import { isAppEmbedActive } from "../helpers/isAppEmbedActive.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const appEmbedActive = await isAppEmbedActive(admin);
  return { shop: session.shop, appEmbedActive };
};

export async function action({ request }) {
  await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  console.log("Data is: " + JSON.stringify(data));
  return null;
}

export default function AdditionalPage() {
  const { shop, appEmbedActive } = useLoaderData();

  // const submit = useSubmit();
  // const [formState, setFormState] = useState({});
  // const [colorState, setColorState] = useState({});
  // function handleSave() {
  //   const data = {
  //     color: formState.color,
  //     color2: formState.color2,
  //   };

  //   submit(data, { method: "post" });
  // }
  // console.log("form Color state:", formState);
  const [color, setColor] = useState("#invalid");
  const [error, setError] = useState("Please enter a valid color format");
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
                Enable Scroll Top App Embed from your theme&amp;s settings.
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
              <s-heading>Enable the Scroll Top App status</s-heading>
              <s-paragraph>
                Use the controls below to set your themes primary colors and
                styles.
              </s-paragraph>
              <s-button>Enable ScrollTop</s-button>
            </s-stack>
          </s-stack>
        </s-stack>
      </s-section>

      <s-section>
        <s-stack gap="base" justifyContent="start">
          <s-text-field label="Theme name" />
          <s-color-field
            label="Brand color"
            name="Color"
            value={color}
            error={error}
            required
            onChange={(e) => {
              const newColor = e.currentTarget.value;
              console.log("Color changed to:", newColor);
              setColor(newColor);
              setError(
                /^#([0-9A-F]{3}){1,2}$/i.test(newColor)
                  ? ""
                  : "Please enter a valid color format",
              );
            }}
          />
        </s-stack>
      </s-section>
      <s-box slot="aside">
        {/* === */}
        {/* Puzzle summary */}
        {/* === */}
        <s-section heading="Puzzle summary">
          <s-heading>Mountain view</s-heading>
          <s-unordered-list>
            <s-list-item>16-piece puzzle with medium difficulty</s-list-item>
            <s-list-item>Pieces can be rotated</s-list-item>
            <s-list-item>No time limit</s-list-item>
            <s-list-item>
              <s-stack direction="inline" gap="small">
                <s-text>Current status:</s-text>
                <s-badge color="base" tone="success">
                  Active
                </s-badge>
              </s-stack>
            </s-list-item>
          </s-unordered-list>
        </s-section>
      </s-box>
      {/* <s-section heading="Multiple pages">
        <s-paragraph>
          The app template comes with an additional page which demonstrates how
          to create multiple pages within app navigation using{" "}
          <s-link
            href="https://shopify.dev/docs/apps/tools/app-bridge"
            target="_blank"
          >
            App Bridge
          </s-link>
          .
        </s-paragraph>
        <s-paragraph>
          To create your own page and have it show up in the app navigation, add
          a page inside <code>app/routes</code>, and a link to it in the{" "}
          <code>&lt;ui-nav-menu&gt;</code> component found in{" "}
          <code>app/routes/app.jsx</code>.
        </s-paragraph>
      </s-section>
      <s-section slot="aside" heading="Resources">
        <s-unordered-list>
          <s-list-item>
            <s-link
              href="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
              target="_blank"
            >
              App nav best practices
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
      <s-section>
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
            <s-stack justifyContent="end">
              <s-button commandFor="color-popover">
                <div
                  style={{
                    backgroundColor: "#FF0000",
                    width: "40px",
                    height: "20px",
                  }}
                ></div>
              </s-button>
            </s-stack>
            <s-popover id="color-popover">
              <s-color-picker
              // name="color2"
              // value={formState.color2}
              // onInput={(e) =>
              //   setFormState({ ...formState, color2: e.target.value })
              // }
              />
            </s-popover>
          </s-stack>

          <s-color-picker
            name="Colo"
            value={colorState}
            onInput={(e) => {
              setColorState({ ...colorState, color2: e.currentValue.value });
              console.log("Typing:", colorState);
            }}
          />
          <s-color-field
            placeholder="Select a color"
            name="color2"
            value={formState.color2}
            onInput={(e) =>
              setFormState({ ...formState, color2: e.target.value })
            }
          />
          <s-button type="submit" variant="primary">
            Save
          </s-button>
        </form>
      </s-section> */}
    </s-page>
  );
}
