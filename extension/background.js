browser.experiments.normandy.setManualMode(true);

browser.browserAction.onClicked.addListener(async () => {
  await browser.tabs.create({
    url: "content.html",
  });
});
