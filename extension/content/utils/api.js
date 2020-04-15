export default class Api {
  constructor(environment) {
    this.environment = environment;
  }
  getBaseUrl() {
    throw new Error("getBaseURL() needs to be implemented");
  }

  formatHeaders({ extraHeaders, ...options }) {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    if (!(options.body && options.body instanceof FormData)) {
      headers.append("Content-Type", "application/json");
    }
    return {
      headers,
      method: "GET",
      ...options,
    };
  }

  async request(url, settings) {
    const response = await fetch(url, settings);

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
