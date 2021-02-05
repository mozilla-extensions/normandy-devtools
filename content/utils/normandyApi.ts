import { AuthState, Environment } from "devtools/contexts/environment";
import { Extension, FilterApiResponse } from "devtools/types/normandyApi";
import {
  Action,
  ApprovalRequest,
  RecipeV3,
  Revision,
} from "devtools/types/recipes";
import API, { ApiRequestOptions, RequestError } from "devtools/utils/api";
import { SECOND } from "devtools/utils/timeConstants";

export interface ApiPage<T> {
  results: Array<T>;
  count: number;
  next: string | null;
  previous: string | null;
}

export default class NormandyAPI extends API {
  auth: AuthState;

  writableConnected: boolean;

  writeableConnected: boolean;

  constructor(
    environment: Environment,
    auth?: AuthState,
    writeableConnected?: boolean,
  ) {
    super(environment);
    this.auth = auth;
    this.writeableConnected = writeableConnected;
  }

  getBaseUrl({
    version = 3,
    method,
  }: {
    version?: number;
    method: string;
  }): string {
    const isReadOperation = ["GET", "HEAD"].includes(method.toUpperCase());
    const base =
      isReadOperation && !this.writeableConnected
        ? this.environment.readOnlyUrl
        : this.environment.writeableUrl;
    return new URL(`api/v${version}/`, base).href;
  }

  async request<T = unknown>(options: ApiRequestOptions): Promise<T> {
    const { method = "GET" } = options;
    const isReadOperation = ["GET", "HEAD"].includes(method.toUpperCase());

    const normandyHeaders: Record<string, string> = {};
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

  fetchRecipePage(searchParams = {}): Promise<ApiPage<RecipeV3>> {
    return this.request({
      url: "recipe/",
      data: searchParams,
    });
  }

  async fetchAllRecipes(searchParams = {}): Promise<Array<RecipeV3>> {
    let response = await this.request<ApiPage<RecipeV3>>({
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

  async fetchRecipe(id: number): Promise<RecipeV3> {
    return this.request<RecipeV3>({
      url: `recipe/${id}/`,
    });
  }

  async saveRecipe(id: number, data: Partial<Revision>): Promise<RecipeV3> {
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
   */
  async patchRecipe(
    recipeId: number,
    data: Partial<Revision>,
  ): Promise<RecipeV3> {
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

  async fetchAllActions(): Promise<Array<Action>> {
    let response = await this.request<ApiPage<Action>>({
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

  async fetchFilters(): Promise<FilterApiResponse> {
    return this.request({ url: "filters/" });
  }

  async fetchAllExtensions(): Promise<Array<Extension>> {
    let response = await this.request<ApiPage<Extension>>({
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

  async fetchExtensionsPage({
    page = 1,
  }: {
    page: number;
  }): Promise<ApiPage<Extension>> {
    return this.request({
      url: "extension/",
      data: {
        page,
      },
    });
  }

  async fetchExtension(id: number): Promise<Extension> {
    return this.request({
      url: `extension/${id}/`,
    });
  }

  async createExtension({
    name,
    xpi,
  }: {
    name: string;
    xpi: File;
  }): Promise<Extension> {
    const body = new FormData();
    body.append("name", name);
    body.append("xpi", xpi);
    const extension = await this.request<Extension>({
      method: "POST",
      url: "extension/",
      body,
    });
    return extension;
  }

  async fetchApprovalRequests(
    searchParams = {},
  ): Promise<Array<ApprovalRequest>> {
    let response = await this.request<ApiPage<ApprovalRequest>>({
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

  requestApproval(revisionId: number): Promise<ApprovalRequest> {
    return this.request({
      url: `recipe_revision/${revisionId}/request_approval/`,
      method: "POST",
    });
  }

  closeApprovalRequest(approvalRequestId: number): Promise<unknown> {
    return this.request({
      url: `approval_request/${approvalRequestId}/close/`,
      method: "POST",
    });
  }

  approveApprovalRequest(
    approvalRequestId: number,
    comment: string,
  ): Promise<unknown> {
    return this.request({
      url: `approval_request/${approvalRequestId}/approve/`,
      data: {
        comment,
      },
      method: "POST",
    });
  }

  rejectApprovalRequest(
    approvalRequestId: number,
    comment: string,
  ): Promise<unknown> {
    return this.request({
      url: `approval_request/${approvalRequestId}/reject/`,
      data: {
        comment,
      },
      method: "POST",
    });
  }

  enableRecipe(recipeId: number): Promise<RecipeV3> {
    return this.request({
      url: `recipe/${recipeId}/enable/`,
      method: "POST",
    });
  }

  disableRecipe(recipeId: number): Promise<RecipeV3> {
    return this.request({
      url: `recipe/${recipeId}/disable/`,
      method: "POST",
    });
  }

  checkLBHeartbeat({
    timeoutAfter = 3 * SECOND,
  }: {
    timeoutAfter: number;
  }): Promise<unknown> {
    return this.request({
      url: new URL("/__lbheartbeat__/", this.environment.writeableUrl),
      timeoutAfter,
    });
  }

  fetchRecipeHistory(recipeId: number): Promise<Revision[]> {
    return this.request({
      url: `recipe/${recipeId}/history/`,
    });
  }
}
