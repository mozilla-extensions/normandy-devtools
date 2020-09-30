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

  async fetchExperiment(slug) {
    return this.request({
      url: `experiments/${slug}/`,
    });
  }
}
