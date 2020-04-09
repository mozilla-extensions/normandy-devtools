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

const injectionSite = document.getElementById(
  "ndt-export-button-injection-site",
);

// If an injection site exists we must be on Experimenter so attempt to inject the button
if (injectionSite) {
  Object.keys(experimenterUrls).forEach((url) => {
    if (window.location.href.startsWith(url)) {
      injectionSite.innerHTML = ""; // Make sure the injection site is clear

      // Hide the existing export button
      const oldButton = document.querySelector(
        '[data-target="#normandyModal"]',
      );
      if (oldButton) {
        oldButton.classList.add("d-none");
      }

      // Create the new button
      const experimenterSlug = injectionSite.dataset.slug;
      const { environmentKey } = experimenterUrls[url];
      const exportButton = document.createElement("a");
      exportButton.classList.add("col", "btn", "btn-primary", "mb-3");
      exportButton.setAttribute("target", "_blank");
      exportButton.setAttribute(
        "href",
        `ext+normandy://${environmentKey}/recipes/import/${experimenterSlug}`,
      );
      exportButton.textContent = "Export to Normandy";

      const exportButtonIcon = document.createElement("span");
      exportButtonIcon.classList.add("fas", "fa-file-import", "mr-2");
      exportButton.prepend(exportButtonIcon);

      injectionSite.appendChild(exportButton);
    }
  });
}
