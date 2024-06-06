chrome.webNavigation.onCompleted.addListener(function (details) {
    console.log("Page loaded from", details);
});
