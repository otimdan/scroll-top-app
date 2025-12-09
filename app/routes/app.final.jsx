import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import { isAppEmbedActive } from "../helpers/isAppEmbedActive.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const appEmbedActive = await isAppEmbedActive(admin);
  return { shop: session.shop, appEmbedActive };
};

export default function AppFinal() {
  const { shop, appEmbedActive } = useLoaderData();
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
              <s-heading>Edit Scroll Top App settings</s-heading>
              <s-paragraph>
                Use the controls below to set your button&amp;s primary colors
                and styles.
              </s-paragraph>
            </s-stack>
          </s-stack>
        </s-stack>
      </s-section>

      {/* Form for data entry */}
    </s-page>
  );
}
