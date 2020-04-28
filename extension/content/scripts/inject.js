import { ENVIRONMENTS } from "devtools/config";

// Re-map environments to experimenter URLs
const experimenterUrls = {};
Object.keys(ENVIRONMENTS).forEach((k) => {
  const env = ENVIRONMENTS[k];
  if (env.experimenterUrl) {
    experimenterUrls[env.experimenterUrl] = {
      ...env,
      environmentKey: k,
    };
  }
});

function injectImportLink(element, environment) {
  const { environmentKey } = environment;
  element.setAttribute(
    "href",
    `ext+normandy://${environmentKey}/recipes/import/${element.dataset.slug}`,
  );
}

function injectRecipeDetailsLink(element, environment) {
  const { environmentKey } = environment;
  element.setAttribute(
    "href",
    `ext+normandy://${environmentKey}/recipes/${element.dataset.recipeId}`,
  );
}

if (document.body.dataset.ndt === "experimenter") {
  document.querySelectorAll("[data-ndt-add-class]").forEach((
    /** @type {HTMLElement} */ el,
  ) => {
    el.classList.add(el.dataset.ndtAddClass);
  });

  document.querySelectorAll("[data-ndt-remove-class]").forEach((
    /** @type {HTMLElement} */ el,
  ) => {
    el.classList.remove(el.dataset.ndtRemoveClass);
  });

  Object.keys(experimenterUrls).forEach((url) => {
    if (window.location.href.startsWith(url)) {
      document.querySelectorAll("[data-ndt-inject]").forEach((
        /** @type {HTMLElement} */ el,
      ) => {
        let injector;
        switch (el.dataset.ndtInject) {
          case "recipe-details-link":
            injector = injectRecipeDetailsLink;
            break;

          case "import-link":
            injector = injectImportLink;
            break;
        }

        if (injector) {
          injector(el, experimenterUrls[url]);
        }
      });
    }
  });
}
