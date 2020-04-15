import Api from "devtools/utils/api";
export default class NormandyAPI extends Api {
  constructor(environment, auth) {
    super(environment);
    this.auth = auth;
  }

  getBaseUrl({ version = 3, mode }) {
    const base =
      mode.toLowerCase() === "w"
        ? this.environment.writeableUrl
        : this.environment.readOnlyUrl;

    return new URL(`api/v${version}/`, base).href;
  }

  async request({ version = 3, url, extraHeaders, ...options }) {
    const settings = super.formatHeaders({ extraHeaders, ...options });

    const isReadOperation = ["GET", "HEAD"].includes(
      settings.method.toUpperCase(),
    );
    const mode = isReadOperation ? "r" : "w";
    const apiUrl = new URL(url, this.getBaseUrl({ version, mode }));

    if (!isReadOperation) {
      settings.headers.append(
        "Authorization",
        `Bearer  ${this.auth.result.accessToken}`,
      );
    }

    if ("data" in settings) {
      if ("body" in settings) {
        throw new Error(
          "Only pass one of `settings.data` and `settings.body`.",
        );
      }

      if (isReadOperation) {
        Object.entries(settings.data).forEach(([key, value]) => {
          apiUrl.searchParams.append(key, value);
        });
      } else {
        settings.body = JSON.stringify(settings.data);
      }

      delete settings.data;
    }

    return super.request(apiUrl, settings);
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
