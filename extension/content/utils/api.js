export default class NormandyAPI {
  constructor(environment, auth) {
    this.environment = environment;
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
    const headers = new Headers();
    headers.append("Accept", "application/json");
    if (!(options.body && options.body instanceof FormData)) {
      headers.append("Content-Type", "application/json");
    }

    for (let headerName in extraHeaders) {
      headers.append(headerName, extraHeaders[headerName]);
    }

    const settings = {
      headers,
      credentials: "same-origin",
      method: "GET",
      ...options,
    };

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
    console.log(JSON.stringify(settings));
    const response = await fetch(apiUrl, settings);

    if (!response.ok) {
      let message;
      let data = {};
      let err;

      try {
        data = await response.json();
        message = data.detail || response.statusText;
      } catch (error) {
        message = error.message;
        err = error;
      }

      data = { ...data, status: response.status };

      throw new RequestError(message, data, err);
    }

    if (response.status !== 204) {
      return response.json();
    }

    return null;
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

export class RequestError extends Error {
  constructor(message, data = {}, originalError) {
    super(message);
    this.name = "RequestError";
    this.data = data;
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}
