const restoreUrl =
  localStorage.getItem("dev-mode-last-page") ?? "ext+normandy://";
window.location.href = restoreUrl;
