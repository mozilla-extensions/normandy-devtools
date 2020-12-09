/* eslint-env node */

export const DEFAULT_ENV = process.env.NDT_DEFAULT_ENV || "prod";

export const ENVIRONMENTS = {
  prod: {
    readOnlyUrl: "https://normandy.cdn.mozilla.net/",
    writeableUrl: "https://prod-admin.normandy.prod.cloudops.mozgcp.net/",
    oidcClientId: "dWcDz6ZYNuevquzzvAgRYOgBZLxY0ucx",
    oidcDomain: "auth.mozilla.auth0.com",
    experimenterUrl: "https://experimenter.services.mozilla.com/",
  },
  stage: {
    readOnlyUrl: "https://stage.normandy.nonprod.cloudops.mozgcp.net/",
    writeableUrl: "https://stage-admin.normandy.nonprod.cloudops.mozgcp.net/",
    oidcClientId: "iQwPHkpTw1RmbYe6ov2qFMfxbVN7DOB7",
    oidcDomain: "auth.mozilla.auth0.com",
    experimenterUrl: "https://stage.experimenter.nonprod.dataops.mozgcp.net/",
  },
  dev: {
    readOnlyUrl: "https://dev.normandy.nonprod.cloudops.mozgcp.net/",
    writeableUrl: "https://dev-admin.normandy.nonprod.cloudops.mozgcp.net/",
    oidcClientId: "hU1YpGcL82wL04vTPsaPAQmkilrSE7wr",
    oidcDomain: "auth.mozilla.auth0.com",
  },
  local: {
    readOnlyUrl:
      process.env.NDT_LOCAL_READ_ONLY_URL || "http://localhost:8000/",
    writeableUrl:
      process.env.NDT_LOCAL_WRITEABLE_URL || "http://localhost:8000/",
    oidcClientId:
      process.env.NDT_LOCAL_OIDC_CLIENT_ID ||
      "hU1YpGcL82wL04vTPsaPAQmkilrSE7wr",
    oidcDomain: process.env.NDT_LOCAL_OIDC_DOMAIN || "auth.mozilla.auth0.com",
    experimenterUrl: process.env.NDT_LOCAL_EXPERIMENTER_URL,
  },
};
