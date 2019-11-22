import { ENVIRONMENTS } from "devtools/config";

function updateQueryString(url, qs) {
  for (const [key, value] of Object.entries(qs)) {
    url.searchParams.set(key, value);
  }
  return url;
}

export async function* fetchRecipes(environmentName, qs = {}) {
  const environmentUrl = ENVIRONMENTS[environmentName];
  let url = updateQueryString(new URL(`${environmentUrl}api/v3/recipe/`), qs);

  while (url) {
    let res = await fetch(url);
    let data = await res.json();
    url = data.next;
    for (const recipe of data.results) {
      yield recipe;
    }
  }
}

export async function fetchRecipePage(environmentName, page = 1, qs = {}) {
  const environmentUrl = ENVIRONMENTS[environmentName];
  let url = updateQueryString(new URL(`${environmentUrl}api/v3/recipe/`), {
    page,
    ...qs,
  });
  let res = await fetch(url);
  return res.json();
}

export async function fetchRecipeHistory(environmentName, recipeId, qs = {}) {
  const environmentUrl = ENVIRONMENTS[environmentName];
  let url = updateQueryString(
    new URL(`${environmentUrl}api/v3/recipe/${recipeId}/history/`),
    qs,
  );
  let res = await fetch(url);
  if (res.status >= 200 && res.status < 300) {
    return res.json();
  }
  let error = new Error(`Non-200 status: ${res.status}`);
  error.response = res;
  error.data = await res.json();
  throw error;
}

export default {
  fetchRecipes,
  fetchRecipePage,
  fetchRecipeHistory,
};
