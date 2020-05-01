browser.browserAction.onClicked.addListener(async () => {
  await browser.tabs.create({
    url: "content.html",
  });
});

if (__BUILD__.isDevelopment) {
  browser.tabs.create({
    url: "restore.html",
  });
}
