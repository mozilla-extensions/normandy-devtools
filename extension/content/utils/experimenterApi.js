import Api from "devtools/utils/api";
export default class ExperimenterAPI extends Api {
  getBaseUrl() {
    return new URL("api/v1/", this.environment.experimenterUrl).href;
  }
  async request({ url, extraHeaders, ...options }) {
    const apiUrl = new URL(url, this.getBaseUrl());
    const settings = super.formatHeaders({ extraHeaders, ...options });
    return super.request(apiUrl, settings);
  }

  async fetchRecipe(slug) {
    return this.request({
      url: `experiments/${slug}/recipe`,
    });
  }
}
