import _ from "lodash";

import { AuthState, Environment } from "devtools/contexts/environment";
import { ActionArguments } from "devtools/types/arguments";
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

export type RevisionForPost<T = ActionArguments> = Omit<
  Revision<T>,
  "action"
> & {
  action_id: number;
};

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

  private async fetchAllPages<T>(
    url: string,
    searchParams: Record<string, string> = {},
  ): Promise<Array<T>> {
    // fetch the first page of results
    const response = await this.request<ApiPage<T>>({
      url,
      data: { ...searchParams, page: 1 },
    });
    let results = response.results;

    // request all the other pages in parallel, the browser will rate limit them
    if (response.count > results.length) {
      const pageCount = Math.ceil(response.count / results.length);
      const pageResponses = await Promise.all(
        _.range(2, pageCount + 1).map((page) =>
          this.request<ApiPage<T>>({
            url,
            data: { ...searchParams, page },
          }),
        ),
      );
      for (const pageResponse of pageResponses) {
        results = [...results, ...pageResponse.results];
      }
    }

    return results;
  }

  async fetchAllRecipes(
    searchParams: Record<string, string> = {},
  ): Promise<Array<RecipeV3>> {
    return this.fetchAllPages("recipe/", searchParams);
  }

  async fetchRecipe(id: number): Promise<RecipeV3> {
    return this.request<RecipeV3>({
      url: `recipe/${id}/`,
    });
  }

  async saveRecipe(id: number, data: RevisionForPost): Promise<RecipeV3> {
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

  async patchMetaDataRecipe(
    revisionId: number,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const url = `recipe_revision/${revisionId}/metadata/`;
    return this.request({ url, method: "PATCH", data });
  }

  async fetchAllActions(): Promise<Array<Action>> {
    return this.fetchAllPages("action/");
  }

  async fetchFilters(): Promise<FilterApiResponse> {
    return this.request({ url: "filters/" });
  }

  async fetchAllExtensions(): Promise<Array<Extension>> {
    return this.fetchAllPages("extension/");
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
