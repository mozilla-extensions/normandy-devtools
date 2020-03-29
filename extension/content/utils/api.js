export default class NormandyAPI {
  constructor(environment) {
    this.environment = environment;
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

  async fetchRecipe(id, { version = 3 }) {
    return this.request({
      url: `recipe/${id}/`,
      version,
    });
  }

  async fetchActions({ version = 3 }) {
    return this.request({
      url: "action/",
      version,
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
