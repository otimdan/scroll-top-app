import { useState } from "react";
// import { useSubmit } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
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
