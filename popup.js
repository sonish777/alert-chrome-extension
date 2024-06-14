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
            const columns = [moment(log.timestamp).format("YYYY/MM/DD HH:mm A"), log.event, JSON.stringify(log.metadata)];
            columns.forEach(function (column) {
                const cell = row.insertCell();
                cell.textContent = column;
            });
        });
    }
});

const downloadButton = document.getElementById("downloadLogsBtn");

downloadButton.addEventListener("click", async function () {
    try {
        // Retrieve logs from Chrome local storage
        const data = await chrome.storage.local.get("logs");
        const logs = data.logs || [];
        if (!logs.length) {
            alert("No logs available");
            return;
        }

        // Convert logs to a string format
        const logText = logs
            .map((log) => {
                return `[${log.timestamp}] - ${log.event}\nMetadata: ${JSON.stringify(log.metadata)}\n`;
            })
            .join("\n");

        // Create a Blob from the log text
        const blob = new Blob([logText], { type: "text/plain" });

        // Create a link element and trigger a download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "logs.txt";
        link.click();

        // Cleanup the URL object
        URL.revokeObjectURL(url);
    } catch (err) {
        console.log("Something went wrong when downloading logs", err);
    }
});
