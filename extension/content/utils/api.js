export async function* fetchRecipes(environment, qs = {}) {
  let url = new URL(`${environment.getUrl()}api/v3/recipe/`);
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

export async function fetchRecipePage(environment, page = 1, qs = {}) {
  let url = new URL(`${environment.getUrl()}api/v3/recipe/`);
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
