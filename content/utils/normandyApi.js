import API, { RequestError } from "devtools/utils/api";
import { SECOND } from "devtools/utils/timeConstants";

export default class NormandyAPI extends API {
  constructor(environment, auth, writeableConnected) {
    super(environment);
    this.auth = auth;
    this.writeableConnected = writeableConnected;
  }

  getBaseUrl({ version = 3, method }) {
    const isReadOperation = ["GET", "HEAD"].includes(method.toUpperCase());
    const base =
      isReadOperation && !this.writeableConnected
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

  /**
   * Issue a PATCH request, updating the specified fields and not editing unspecified fields.
   * @param {number} recipeId
   * @param {Partial<import("devtools/types/recipes").Revision>} data
   */
  async patchRecipe(recipeId, data) {
    let url = "recipe/";
    if (recipeId) {
      url = `recipe/${recipeId}/`;
    }

    return this.request({
      url,
      method: "PATCH",
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

  async fetchApprovalRequests(searchParams = {}) {
    let response = await this.request({
      url: "approval_request/",
      data: searchParams,
    });
    let approvalRequests = response.results;

    while (response.next) {
      response = await this.request({
        url: response.next,
      });
      approvalRequests = [...approvalRequests, ...response.results];
    }

    return approvalRequests;
  }

  requestApproval(revisionId) {
    return this.request({
      url: `recipe_revision/${revisionId}/request_approval/`,
      method: "POST",
    });
  }

  closeApprovalRequest(approvalRequestId) {
    return this.request({
      url: `approval_request/${approvalRequestId}/close/`,
      method: "POST",
    });
  }

  approveApprovalRequest(approvalRequestId, comment) {
    return this.request({
      url: `approval_request/${approvalRequestId}/approve/`,
      data: {
        comment,
      },
      method: "POST",
    });
  }

  rejectApprovalRequest(approvalRequestId, comment) {
    return this.request({
      url: `approval_request/${approvalRequestId}/reject/`,
      data: {
        comment,
      },
      method: "POST",
    });
  }

  enableRecipe(recipeId) {
    return this.request({
      url: `recipe/${recipeId}/enable/`,
      method: "POST",
    });
  }

  disableRecipe(recipeId) {
    return this.request({
      url: `recipe/${recipeId}/disable/`,
      method: "POST",
    });
  }

  checkLBHeartbeat({ timeoutAfter = 3 * SECOND }) {
    return this.request({
      url: new URL("/__lbheartbeat__/", this.environment.writeableUrl),
      timeoutAfter,
    });
  }
}
