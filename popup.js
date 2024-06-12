document.addEventListener("DOMContentLoaded", function () {
    chrome.runtime.sendMessage({ action: "getLogs" });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "displayLogs") {
        const logTable = document.getElementById("logTable");
        const tbody = logTable.getElementsByTagName("tbody")[0];
        tbody.innerHTML = ""; // Clear previous logs

        message.logs.forEach(function (log) {
            const row = tbody.insertRow();
            const columns = [log.timestamp, log.service, log.event, JSON.stringify(log.metadata)];
            columns.forEach(function (column) {
                const cell = row.insertCell();
                cell.textContent = column;
            });
        });
    }
});
