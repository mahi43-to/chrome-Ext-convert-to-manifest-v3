chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "parseHTML" && message.html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(message.html, "text/html");
        sendResponse({ document: doc.documentElement.innerHTML });
    }
});
