const API_URL = "https://normandy.cdn.mozilla.net/api/v3";

export async function* fetchRecipes(qs = {}) {
  let url = new URL(`${API_URL}/recipe/`);
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

export async function fetchRecipePage(page = 1, qs = {}) {
  let url = new URL(`${API_URL}/recipe/`);
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
