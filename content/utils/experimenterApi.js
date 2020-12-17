import API from "devtools/utils/api";

export default class ExperimenterAPI extends API {
  getBaseUrl({ version = 1 }) {
    return new URL(`api/v${version}/`, this.environment.experimenterUrl).href;
  }

  async fetchRecipe(slug) {
    return this.request({
      url: `experiments/${slug}/recipe/`,
    });
  }

  /** @return {Promise<import("devtools/types/experimenterApi").ExperimenterResponse>} */
  async fetchExperiment(slug) {
    return this.request({
      url: `experiments/${slug}/`,
    });
  }

  async fetchExperiments(searchParams = {}) {
    return this.request({
      url: "experiments/",
      data: searchParams,
    });
  }
}
