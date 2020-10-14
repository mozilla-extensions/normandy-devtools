import { SECOND } from "devtools/utils/timeConstants";

export default class API {
  constructor(environment) {
    this.environment = environment;
  }

  /**
   * @param {Object} args
   * @param {number} args.version
   * @param {string} args.method
   * @returns {String}
   * */
  // eslint-disable-next-line no-unused-vars
  getBaseUrl({ version, method }) {
    throw new Error("getBaseURL() needs to be implemented");
  }

  /**
   * @param {Object} args
   * @param {string} args.url
   * @param {number} [args.version]
   * @param {Object} [args.extraHeaders]
   * @param {number} [args.timeoutAfter]
   * @param {string|FormData} [args.body]
   * @param {Object} [args.data] Data to convert JSON serialize into the querystring (for GET and HEAD requests) or the request body (for other methods).
   */
  async request({
    url,
    version,
    extraHeaders = {},
    timeoutAfter = 10 * SECOND,
    ...options
  }) {
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

    const controller = new AbortController();

    let timeout;
    if (timeoutAfter > 0) {
      timeout = setTimeout(() => {
        controller.abort();
      }, timeoutAfter);
    }

    let response;
    try {
      response = await fetch(apiUrl.toString(), settings);
    } catch (err) {
      if (err.name === "AbortError") {
        throw new RequestError(
          "The request timed out.",
          {
            url: apiUrl.toString(),
            timeout: `${timeoutAfter}ms`,
          },
          err,
        );
      }

      throw err;
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }

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

    if (
      response.status !== 204 &&
      response.headers.get("Content-Type") === "application/json"
    ) {
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
