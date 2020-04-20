import API from "devtools/utils/api";

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

  async fetchActions() {
    return this.request({
      url: "action/",
    });
  }

  async fetchFilters() {
    return this.request({ url: "filters/" });
  }
}
