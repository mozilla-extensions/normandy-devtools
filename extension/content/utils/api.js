import { ENVIRONMENTS } from "devtools/config";

export async function* fetchRecipes(environmentName, qs = {}) {
  const environmentUrl = ENVIRONMENTS[environmentName];
  let url = new URL(`${environmentUrl}api/v3/recipe/`);
  for (const [key, value] of Object.entries(qs)) {
    url.searchParams.set(key, value);
  }

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
  let url = new URL(`${environmentUrl}api/v3/recipe/`);
  qs.page = page;
  for (const [key, value] of Object.entries(qs)) {
    url.searchParams.set(key, value);
  }
  let res = await fetch(url);
  return res.json();
}

export default {
  fetchRecipes,
  fetchRecipePage,
};
