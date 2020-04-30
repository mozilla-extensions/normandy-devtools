import API, { RequestError } from "devtools/utils/api";

export default class NormandyAPI extends API {
  constructor(environment, auth) {
    super(environment);
    this.auth = auth;
  }

  getBaseUrl({ version = 3, method }) {
    const isReadOperation = ["GET", "HEAD"].includes(method.toUpperCase());
    const base = isReadOperation
      ? this.environment.readOnlyUrl
      : this.environment.writeableUrl;
    return new URL(`api/v${version}/`, base).href;
  }

  async request(options) {
    const { method = "GET" } = options;
    const isReadOperation = ["GET", "HEAD"].includes(method.toUpperCase());

    const normandyHeaders = {};
    if (!isReadOperation) {
      if (!this.auth || !this.auth.result) {
        throw new RequestError(
          "You must be authenticated to complete this request.",
        );
      }

      normandyHeaders.Authorization = `Bearer ${this.auth.result.accessToken}`;
    }

    return super.request({
      ...options,
      extraHeaders: {
        ...options.extraHeaders,
        ...normandyHeaders,
      },
    });
  }

  fetchRecipePage(page, searchParams = {}) {
    return this.request({
      url: "recipe/",
      data: {
        ...searchParams,
        page,
      },
    });
  }

  async fetchAllRecipes(searchParams = {}) {
    let response = await this.request({
      url: "recipe/",
      data: searchParams,
    });
    let recipes = response.results;

    while (response.next) {
      response = await this.request({
        url: response.next,
      });
      recipes = [...recipes, ...response.results];
    }

    return recipes;
  }

  async fetchRecipe(id) {
    return this.request({
      url: `recipe/${id}/`,
    });
  }

  async saveRecipe(id, data) {
    let url = "recipe/";
    let method = "POST";
    if (id) {
      url = `recipe/${id}/`;
      method = "PUT";
    }

    return this.request({
      url,
      method,
      data,
    });
  }

  async fetchAllActions() {
    let response = await this.request({
      url: "action/",
    });
    let actions = response.results;

    while (response.next) {
      response = await this.request({
        url: response.next,
      });
      actions = [...actions, ...response.results];
    }

    return actions;
  }

  async fetchFilters() {
    return this.request({ url: "filters/" });
  }

  async fetchAllExtensions() {
    let response = await this.request({
      url: "extension/",
    });
    let extensions = response.results;

    while (response.next) {
      response = await this.request({
        url: response.next,
      });
      extensions = [...extensions, ...response.results];
    }

    return extensions;
  }
}
