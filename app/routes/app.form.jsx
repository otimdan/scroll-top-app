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
      color2: formState.color2,
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
            placeholder="Select a color"
            name="color2"
            value={formState.color2}
            error={error}
            onChange={(e) => {
              const newColor = e.currentTarget.value;
              console.log("Color changed to:", newColor);
              setFormState({ ...formState, color2: newColor });
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
    </s-page>
  );
}
