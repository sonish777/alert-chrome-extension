console.log("CONTENT SCRIPTING GOES HERE");

// Define the selectors for the send button and attachment elements
const sendButtonSelector = 'div[role="button"][data-tooltip*="Send"]';
const attachmentSelector = 'div[aria-label*="Attachment"]';
// Function to get the recipient email address
function getRecipientEmails() {
    const toFields = document.querySelectorAll('div[name="to"] div[data-hovercard-id][data-name]');
    const toEmails = [];
    toFields.forEach((el) => {
        const email = el.getAttribute("data-hovercard-id");
        const name = el.getAttribute("data-name");
        if (email) {
            toEmails.push(`${email}${name ? ` (${name})` : ""}`);
        }
    });
    return toEmails;
}

// Function to get the sender email address
function getSenderEmail() {
    const accountButton = document.querySelector('a[href^="https://accounts.google.com/SignOutOptions"]');
    return accountButton ? accountButton.getAttribute("aria-label").replace(/.*\(|\).*/g, "") : "unknown";
}

// Function to get additional metadata
function getMetadata() {
    return {
        browser: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        vendor: navigator.vendor
    };
}

async function getLogsFromStorage() {
    try {
        return await chrome.storage.local.get(["logs"]);
    } catch (error) {
        console.log("Something went wrong when fetching logs from local store:", error);
    }
}

async function setLogsToStorage() {
    try {
        const oldLogs = await getLogsFromStorage();
        console.log("🚀 ~ setLogsToStorage ~ oldLogs:", oldLogs);
        return await chrome.storage.local.set(["logs"]);
    } catch (error) {
        console.log("Something went wrong when fetching logs from local store:", error);
    }
}

function sendMessageToBackground(message) {
    chrome.runtime.sendMessage(message);
}

// Function to check and alert based on the presence of attachments
function checkAttachments() {
    const attachment = document.querySelector(attachmentSelector);
    const hasAttachment = attachment && attachment.children.length > 0;
    const recipientEmails = getRecipientEmails();
    const senderEmail = getSenderEmail();

    const logData = {
        timestamp: new Date().toISOString(),
        service: "GMAIL",
        event: `Mail Sent to '${recipientEmails.join(", ")}' by '${senderEmail} ${hasAttachment ? "with" : "without"} attachments'`,
        metadata: getMetadata()
    };

    sendMessageToBackground({ action: "sendLog", logData: logData });
}

// Function to add click event listener to the send button
function addSendButtonListener() {
    const sendButtons = document.querySelectorAll(sendButtonSelector);
    if (sendButtons.length) {
        sendButtons.forEach((button) => {
            button.addEventListener("click", checkAttachments);
        });
    }
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        // Check if new nodes have been added
        if (mutation.addedNodes.length > 0) {
            addSendButtonListener();
        }
    });
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial call to add event listeners (in case the buttons are already present)
addSendButtonListener();
