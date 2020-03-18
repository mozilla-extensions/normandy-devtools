/* global process */

export const DEFAULT_ENV = process.env.NDT_DEFAULT_ENV || "prod";

export const ENVIRONMENTS = {
  prod: {
    readOnlyUrl: "https://normandy.cdn.mozilla.net/",
    writeableUrl: "https://prod-admin.normandy.prod.cloudops.mozgcp.net/",
    oidcClientId: "dWcDz6ZYNuevquzzvAgRYOgBZLxY0ucx",
    oidcDomain: "auth.mozilla.auth0.com",
  },
  stage: {
    readOnlyUrl: "https://stage.normandy.nonprod.cloudops.mozgcp.net/",
    writeableUrl: "https://stage-admin.normandy.nonprod.cloudops.mozgcp.net/",
    oidcClientId: "iQwPHkpTw1RmbYe6ov2qFMfxbVN7DOB7",
    oidcDomain: "auth.mozilla.auth0.com",
  },
  dev: {
    readOnlyUrl: "https://dev.normandy.nonprod.cloudops.mozgcp.net/",
    writeableUrl: "https://dev-admin.normandy.nonprod.cloudops.mozgcp.net/",
    oidcClientId: "hU1YpGcL82wL04vTPsaPAQmkilrSE7wr",
    oidcDomain: "auth.mozilla.auth0.com",
  },
  local: {
    readOnlyUrl:
      process.env.NDT_LOCAL_READ_ONLY_URL || "https://localhost:8000/",
    writeableUrl:
      process.env.NDT_LOCAL_WRITEABLE_URL || "https://localhost:8000/",
    oidcClientId:
      process.env.NDT_LOCAL_OIDC_CLIENT_ID ||
      "hU1YpGcL82wL04vTPsaPAQmkilrSE7wr",
    oidcDomain: process.env.NDT_LOCAL_OIDC_DOMAIN || "auth.mozilla.auth0.com",
  },
};
