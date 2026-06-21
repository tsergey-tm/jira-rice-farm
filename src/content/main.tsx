import {getCurrentRoute, isJira, Routes} from "@/utils/JiraUtils.ts";
import {type TabMessage, TabMessageType} from "@/types/Message.ts";
import './main.css';
import {modifyBoard, modifyBoardIcon, modifyIssuesList, modifySelectedIssue, modifySettings} from "@/modifiers";
import {jiraBoardDataStore} from "@/data/JiraData.ts";

const observer = new MutationObserver(() => {

    runContentModification();
});

const runContentModification = () => {

    if (isJira()) {
        observer.observe(document.body, {childList: true, subtree: true});

        const route: string = getCurrentRoute();

        switch (route) {
            case Routes.BOARD:
                modifyBoardIcon();
                modifyBoard();
                modifySelectedIssue();
                break;
            case Routes.SETTINGS:
                modifySettings();
                break;
            case Routes.ISSUES_LIST:
                modifyBoardIcon();
                modifyIssuesList();
                modifySelectedIssue();
                break;
            default:
                break;
        }
    }
}

runContentModification();

const reloadJiraBoardInfo = () => {

    function debounce<T extends () => void>(
        callback: T,
        delay: number
    ): () => void {
        let timer: ReturnType<typeof setTimeout> | null = null;

        return function (): void {
            if (timer !== null) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                callback();
            }, delay);
        };
    }

    debounce(() => jiraBoardDataStore.forceReloadBoardInfo(), 1000)();
}

// Register listener fo messages
chrome.runtime.onMessage.addListener((message: TabMessage) => {
    if (message.type === TabMessageType.URL_CHANGED) {
        console.log('[Jira RICE farm] Tab URL updated');
        runContentModification();
    }
});

// Send message to background script about URL change
void chrome.runtime.sendMessage({type: TabMessageType.URL_CHANGED, url: window.location.href});

console.log('[Jira RICE farm] Tab listeners installed');

reloadJiraBoardInfo();
