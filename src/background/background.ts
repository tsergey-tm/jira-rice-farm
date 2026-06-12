// Background script for Jira RICE extension

chrome.runtime.onInstalled.addListener(() => {
    console.log('[Jira RICE farm] Extension installed');
});

// Listen for tab updates to ensure content script is injected
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('[Jira RICE farm] Tabs URL updated');
        void chrome.tabs.sendMessage(tabId, {type: 'URL_CHANGED', url: tab.url});
    }
});

console.log('[Jira RICE farm] Background listeners installed');
