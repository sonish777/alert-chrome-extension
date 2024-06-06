console.log("CONTENT SCRIPTING GOES HERE");

// Define the selectors for the send button and attachment elements
const sendButtonSelector = 'div[role="button"][data-tooltip*="Send"]';
const attachmentSelector = 'div[aria-label*="Attachment"]';

// Function to check and alert based on the presence of attachments
function checkAttachments() {
    const attachment = document.querySelector(attachmentSelector);
    const hasAttachment = attachment && attachment.children.length > 0;
    if (hasAttachment) {
        alert("You are sending an email with attachments.");
    } else {
        alert("You are sending an email without attachments.");
    }
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
