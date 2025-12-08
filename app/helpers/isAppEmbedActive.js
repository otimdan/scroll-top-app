import { GET_SHOP_THEMES } from "../graphql/queries/getShopThemes.js";
import { GET_THEME_BY_ID } from "../graphql/queries/getThemeById.js";

export const isAppEmbedActive = async (admin) => {
  /*
  The following functions are used to check if the app embed is active in the main theme
  and log relevant information to the console.
  */
  //   Get all themes of a shop
  const getMainThemeID = async () => {
    const getThemes = await admin.graphql(GET_SHOP_THEMES);

    const themesJson = await getThemes.json();
    const themes = themesJson.data.themes.edges;
    const mainTheme = themes.find((theme) => theme.node.role === "MAIN");

    const mainThemeId = mainTheme ? mainTheme.node.id : null;
    return mainThemeId;
  };

  //   Get settings data of main theme
  const getSettingsData = async (themeID) => {
    const getThemeById = await admin.graphql(GET_THEME_BY_ID, {
      variables: {
        id: themeID,
      },
    });
    const result = await getThemeById.json();

    const rawContent = result.data.theme.files.nodes[0]?.body?.content ?? "";
    const cleaned = rawContent.replace(/\/\*[\s\S]*?\*\//, ""); // remove multi-line comment

    return JSON.parse(cleaned);
  };

  //   Checking if App embed is active
  const isAppEmbedDisabled = (parsedData, appHandle) => {
    const blocks = parsedData?.current?.blocks;
    if (!blocks) return true; // If no blocks exist, treat as disabled.

    // Loop over block keys
    for (const blockId of Object.keys(blocks)) {
      const block = blocks[blockId];
      if (block?.type?.includes(appHandle)) {
        return block.disabled === true;
      }
    }

    // If we never found our block, assume disabled.
    return true;
  };

  const themeID = await getMainThemeID();

  return !isAppEmbedDisabled(await getSettingsData(themeID), "scroll-to-top");
  /* 
  End of app embed check functions
   */
};
