console.log("CONTENT SCRIPTING GOES HERE");

// Define the selectors for the send button and attachment elements
const sendButtonSelector = 'div[role="button"][data-tooltip*="Send"]';
const attachmentSelector = 'div[aria-label*="Attachment"]';
const uploadingAttachmentSelector = 'div[aria-label*="Uploading attachment"]';
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
        browser: navigator.userAgent
    };
}

function sendMessageToBackground(message) {
    chrome.runtime.sendMessage(message);
}

function getAllAttachments() {
    const attachments = [];
    const attachmentEls = document.querySelectorAll(`${attachmentSelector} a`);
    if (attachmentEls.length) {
        attachmentEls.forEach((el) => {
            const fileDetailsEl = el.querySelectorAll("div");
            if (fileDetailsEl.length) {
                const [fileName, fileSize] = [fileDetailsEl[0]?.innerText, fileDetailsEl[1]?.innerText];
                if (!fileName && !fileSize) {
                    return;
                }
                attachments.push(`${fileName}${fileSize ? ` ${fileSize}` : ""}`);
            }
        });
    }
    return attachments;
}

// Function to check and alert based on the presence of attachments
function logEmailSend() {
    const recipientEmails = getRecipientEmails();
    const senderEmail = getSenderEmail();
    const attachments = getAllAttachments();
    const logData = {
        timestamp: new Date().toISOString(),
        service: "GMAIL",
        event: `Mail Sent to '${recipientEmails.join(", ")}' by '${senderEmail} ${
            attachments.length ? `with following attachments:\n ${attachments.join(",\n")}` : "without attachments"
        }'`,
        metadata: getMetadata()
    };

    sendMessageToBackground({ action: "sendLog", logData: logData });
}

// Function to add click event listener to the send button
function addSendButtonListener() {
    const sendButtons = document.querySelectorAll(sendButtonSelector);
    if (sendButtons.length) {
        sendButtons.forEach((button) => {
            button.addEventListener("click", logEmailSend);
        });
    }
}

function logAttachmentAdded(addedNodes) {
    if (!addedNodes || !(addedNodes instanceof HTMLElement)) {
        return;
    }
    const attachmentEl = addedNodes.querySelectorAll(`${uploadingAttachmentSelector} tbody tr td span div`);
    if (attachmentEl.length) {
        console.log("🚀 ~ logAttachmentAdded ~ attachmentEl:", attachmentEl)
        const [fileName, fileSize] = [attachmentEl[0]?.innerText, attachmentEl[1]?.innerText];
        if (!fileName && !fileSize) {
            return;
        }
        const senderEmail = getSenderEmail();

        const logData = {
            timestamp: new Date().toISOString(),
            event: `Attachment Added by '${senderEmail}: ${fileName ?? ""}${fileSize ? ` ${fileSize}` : ""}'`,
            metadata: getMetadata()
        };
        sendMessageToBackground({ action: "sendLog", logData: logData });
    }
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        // Check if new nodes have been added
        if (mutation.addedNodes.length > 0) {
            addSendButtonListener();
            logAttachmentAdded(mutation.addedNodes?.[0]);
        }
    });
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial call to add event listeners (in case the buttons are already present)
addSendButtonListener();
