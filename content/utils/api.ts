import { Environment } from "devtools/contexts/environment";
import { has } from "devtools/utils/helpers";
import { SECOND } from "devtools/utils/timeConstants";

export type ApiRequestOptions = RequestInit & {
  method?: string;
  url?: string | URL;
  version?: number;
  extraHeaders?: Record<string, string>;
  timeoutAfter?: number;
  body?: string | FormData;
  data?: Record<string, unknown>;
};

export default class API {
  environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
  }

  /**
   * @param {Object} args
   * @param {number} args.version
   * @param {string} args.method
   * */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getBaseUrl(options: { version: number; method: string }): string {
    throw new Error("getBaseURL() needs to be implemented");
  }

  /**
   * @param [args.data] Data to convert JSON serialize into the querystring
   *    (for GET and HEAD requests) or the request body (for other methods).
   */
  async request<T = unknown>({
    url,
    version,
    extraHeaders = {},
    timeoutAfter = 10 * SECOND,
    ...options
  }: ApiRequestOptions): Promise<T> {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    if (!(options.body && options.body instanceof FormData)) {
      headers.append("Content-Type", "application/json");
    }

    for (const headerName in extraHeaders) {
      headers.append(headerName, extraHeaders[headerName]);
    }

    /** @type {any} */
    const settings: ApiRequestOptions = {
      headers,
      method: "GET",
      ...options,
    };

    const apiUrl = new URL(
      url.toString(),
      this.getBaseUrl({ version, method: settings.method }),
    );

    if ("data" in settings) {
      if ("body" in settings) {
        throw new Error(
          "Only pass one of `settings.data` and `settings.body`.",
        );
      }

      if (settings.method === "GET" || settings.method === "HEAD") {
        Object.entries(settings.data).forEach(([key, value]) => {
          apiUrl.searchParams.append(key, value as string);
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
        message = has("detail", data) ? data.detail : response.statusText;
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
  data: unknown;

  constructor(message: string, data = {}, originalError?: Error) {
    super(message);
    this.name = "RequestError";
    this.data = data;
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}
