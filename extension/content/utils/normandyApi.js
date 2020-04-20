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
      : this.environment.writeOnlyUrl;

    return new URL(`api/v${version}/`, base).href;
  }

  async request(options) {
    const { extraHeaders = [], method = "GET" } = options;

    const isReadOperation = ["GET", "HEAD"].includes(method.toUpperCase());

    if (!isReadOperation) {
      extraHeaders.append(
        "Authorization",
        `Bearer  ${this.auth.result.accessToken}`,
      );
    }

    return super.request({ ...options, extraHeaders });
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
}
