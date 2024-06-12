// chrome.webNavigation.onCompleted.addListener(function (details) {
//     console.log("Page loaded from", details);
// });
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "sendLog") {
        // Add the log to local storage
        addLogToStorage(message.logData);
    } else if (message.action === "getLogs") {
        // Retrieve logs from local storage and send them back to the content script
        getLogsFromStorage();
        return true; // Needed to indicate asynchronous response
    }
});

// Function to add a log entry to storage
function addLogToStorage(logData) {
    chrome.storage.local.get("logs", function (data) {
        const logs = data.logs || [];
        logs.push(logData);
        chrome.storage.local.set({ logs: logs });
        getLogsFromStorage();
    });
}

// Function to retrieve logs from storage
function getLogsFromStorage() {
    chrome.storage.local.get("logs", function (data) {
        const logs = data.logs || [];
        chrome.runtime.sendMessage({ action: "displayLogs", logs: logs });
    });
}
