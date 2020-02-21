export function convertToV1Recipe(v3Recipe, environmentName) {
  // Normandy client expects a v1-style recipe, but we have a v3-style recipe. Convert it.
  const idSuffix = environmentName !== "prod" ? `-${environmentName}` : "";
  return {
    id: `${v3Recipe.id}${idSuffix}`,
    name: v3Recipe.latest_revision.name,
    enabled: v3Recipe.latest_revision.enabled,
    is_approved: v3Recipe.latest_revision.is_approved,
    revision_id: v3Recipe.latest_revision.id,
    action: v3Recipe.latest_revision.action.name,
    arguments: v3Recipe.latest_revision.arguments,
    filter_expression: v3Recipe.latest_revision.filter_expression,
  };
}
