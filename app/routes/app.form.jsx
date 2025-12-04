import { useState } from "react";
import { useSubmit } from "react-router";
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
  const submit = useSubmit();
  const [formState, setFormState] = useState({});
  const [error, setError] = useState("");

  function handleSave() {
    const data = {
      color: formState.color,
      bg_color: formState.bg_color,
      hover_color: formState.hover_color,
      icon_color: formState.icon_color,
    };

    submit(data, { method: "post" });
  }

  return (
    <s-page heading="Form page">
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
          <s-button type="submit" variant="primary">
            Save
          </s-button>
        </form>
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
    </s-page>
  );
}
