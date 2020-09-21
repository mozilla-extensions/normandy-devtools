const restoreUrl =
  localStorage.getItem("dev-mode-last-page") ?? "web+normandy://";
window.location.href = restoreUrl;
