export const GET_METAFIELD_DEFINITION = `#graphql
query MetafieldDefinition($identifier: MetafieldDefinitionIdentifierInput,$first: Int) {
    metafieldDefinition(identifier: $identifier) {
      id
      metafieldsCount
    	name
    	metafields(first: $first) {
      nodes {
        value
        type
      }
    }
    }
  }
  `;

/* Variables
{
  "first": 5,
  "identifier": {"ownerType": "SHOP",
          "namespace": "scrolling",
          "key": "scrolling_test"}
}
          Identifier must contain those 3 for it not to return null
Then value is contained in data.metafieldDefinition.metafields.nodes.value
*/
