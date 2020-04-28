export default class API {
  constructor(environment) {
    this.environment = environment;
  }

  /** @returns {String} */
  getBaseUrl({ version, method }) {
    throw new Error("getBaseURL() needs to be implemented");
  }

  async request({ url, extraHeaders = {}, version = 3, ...options }) {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    if (!(options.body && options.body instanceof FormData)) {
      headers.append("Content-Type", "application/json");
    }

    for (const headerName in extraHeaders) {
      headers.append(headerName, extraHeaders[headerName]);
    }

    /** @type {any} */
    const settings = {
      headers,
      method: "GET",
      ...options,
    };

    const apiUrl = new URL(
      url,
      this.getBaseUrl({ version, method: settings.method }),
    );

    if ("data" in settings) {
      if ("body" in settings) {
        throw new Error(
          "Only pass one of `settings.data` and `settings.body`.",
        );
      }

      if (["GET", "HEAD"].includes(settings.method.toUpperCase())) {
        Object.entries(settings.data).forEach(([key, value]) => {
          apiUrl.searchParams.append(key, value);
        });
      } else {
        settings.body = JSON.stringify(settings.data);
      }

      delete settings.data;
    }

    const response = await fetch(apiUrl.toString(), settings);

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
