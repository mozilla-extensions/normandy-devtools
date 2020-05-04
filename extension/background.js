browser.browserAction.onClicked.addListener(async () => {
  await browser.tabs.create({
    url: "content.html",
  });
});

if (DEVELOPMENT) {
  browser.tabs.create({
    url: "restore.html",
  });
}
