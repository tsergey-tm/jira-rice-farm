import {getBoardData, getBoardId, getCurrentRoute, isJira, Routes} from "@/utils/JiraUtils.ts";
import type {TabMessage} from "@/types/Message.ts";
import './main.css';
import {modifyBoard, modifySettings} from "@/modifiers";
import {jiraBoardDataStore} from "@/data/JiraBoardData.ts";

const observer = new MutationObserver(() => {

    runContentModification();
});

const runContentModification = () => {

    if (isJira()) {
        observer.observe(document.body, {childList: true, subtree: true});

        const route: string = getCurrentRoute(undefined);

        ((routeName) => {
            switch (routeName) {
                case Routes.BOARD:
                    return modifyBoard();
                case Routes.SETTINGS:
                    return modifySettings();
                default:
                    return false;
            }
        })(route);
    }
}

runContentModification();

const forceReloadBoardInfo = () => {
    void getBoardData(getBoardId()!).then(data => {
        if (data) {
            jiraBoardDataStore.setSharedData(data);
        }
    });
}

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

    debounce(forceReloadBoardInfo, 1000)();
}

// Register listener fo messages
chrome.runtime.onMessage.addListener((message: TabMessage) => {
    if (message.type === 'URL_CHANGED') {
        console.log('[Jira RICE farm] Tab URL updated');
        runContentModification();
    } else if (message.type === 'BOARD_DATA_CHANGED') {
        console.log('[Jira RICE farm] Board data changed');
        forceReloadBoardInfo();
    }
});

// Send message to background script about URL change
void chrome.runtime.sendMessage({type: 'URL_CHANGED', url: window.location.href});

console.log('[Jira RICE farm] Tab listeners installed');

reloadJiraBoardInfo();
