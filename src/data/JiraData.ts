import {makeAutoObservable} from 'mobx';
import type {JRFBoardData, JRFBoardDataLink, JRFIssueData, JRFOnlyBoardData} from "@/types/JiraRiceFarmTypes.ts";
import {getBoardIdFromUrl, isJira} from "@/utils/JiraUtils.ts";
import {type TabMessage, TabMessageType} from "@/types/Message.ts";
import {jiraDataSaverLoad, jiraDataSaverSave} from "@/data/JiraDataSaver.ts";


export type JRFBoardDataInfo = {
    loaded: boolean;
    value: JRFBoardData | undefined;
}

export class JiraBoardDataStore {
    readonly isJira: boolean;
    #boardId: string | null = null;
    readonly #boardIdFormUrl: string | null;
    jrfBoardData: JRFBoardDataInfo = {loaded: false, value: undefined};

    constructor() {
        this.isJira = isJira();
        this.#boardIdFormUrl = getBoardIdFromUrl();

        if (this.#boardIdFormUrl !== null) {
            void this.forceReloadBoardInfo();

            // Register listener fo messages
            chrome.runtime.onMessage.addListener((message: TabMessage) => {
                switch (message.type) {
                    case TabMessageType.BOARD_DATA_CHANGED:
                        if (message.boardId === this.#boardIdFormUrl || message.boardId === this.#boardId) {

                            console.log('[Jira RICE farm] Board data changed');
                            void jiraBoardDataStore.forceReloadBoardInfo();
                        }
                        break;
                    default:
                        break;
                }
            });

        }
        makeAutoObservable(this);
    }

    #setBoardData(data: JRFBoardData | undefined) {
        this.jrfBoardData = {loaded: true, value: data};
    }

    getBoardId(): string | null {

        return this.#boardId ? this.#boardId : this.#boardIdFormUrl;
    }

    forceReloadBoardInfo = async (): Promise<JRFBoardData | null> => {
        if (this.#boardIdFormUrl !== null) {
            const data = await this.getFreshBoardInfo();
            if (data) {
                this.#setBoardData(data);
            }
            return data;
        } else {
            return Promise.resolve(null);
        }
    }

    getFreshBoardInfo = async (): Promise<JRFBoardData | null> => {
        const loopDetector: Set<string> = new Set<string>();
        if (this.#boardIdFormUrl !== null) {
            loopDetector.add(this.#boardIdFormUrl);
            let loadedBoardId = this.#boardIdFormUrl;
            let data = await this.getRawBoardData(loadedBoardId);
            while (data && data.type === 'link' && data.linkedBoardId) {
                if (loopDetector.has(data.linkedBoardId)) {
                    throw new Error(`Linked loop detected`);
                }
                loadedBoardId = data.linkedBoardId;
                loopDetector.add(loadedBoardId);
                data = await this.getRawBoardData(loadedBoardId);
            }

            if (data && data.type === 'data' && this.#boardIdFormUrl !== loadedBoardId) {
                this.#boardId = loadedBoardId;
            }

            return data || null;
        } else {
            return Promise.resolve(null);
        }
    }

    private getRawBoardData(loadedBoardId: string) {
        return jiraDataSaverLoad(loadedBoardId);
    }

    modifyBoardDataAndSave = async (newValues: JRFOnlyBoardData) => {
        if (this.#boardIdFormUrl === null) {
            return;
        }

        let data: JRFBoardData | null = await this.getRawBoardData(this.#boardIdFormUrl);

        if (data?.type === 'link') {
            throw new Error(`This board linked to board ${data.linkedBoardId}. Editing this board is prohibited.`);
        }

        if (data === null) {
            data = {
                ...newValues,
                issues: {},
                type: 'data'
            }
        } else {
            data = {
                ...newValues,
                type: 'data',
                issues: data.issues
            }
        }

        await jiraDataSaverSave(this.#boardIdFormUrl, data).then(() => this.forceReloadBoardInfo());
    }

    modifyBoardLinkAndSave = async (newValues: JRFBoardDataLink) => {
        if (this.#boardIdFormUrl === null) {
            return;
        }

        await jiraDataSaverSave(this.#boardIdFormUrl, newValues).then(() => this.forceReloadBoardInfo());
    }

    modifyIssueDataAndSave = async (issueKey: string, newValues: JRFIssueData) => {
        const bId = this.getBoardId();
        if (bId === null) {
            return;
        }

        const data: JRFBoardData | null = await this.getFreshBoardInfo();

        if (!data) {
            throw new Error(`Board data empty, fill it first`);
        } else if (data.type === 'link') {
            throw new Error(`You can't edit linked board`);
        }

        if (!data.issues) {
            data.issues = {};
        }
        data.issues[issueKey] = newValues;
        await jiraDataSaverSave(bId, data).then(() => this.forceReloadBoardInfo());
    }
}

export const jiraBoardDataStore = new JiraBoardDataStore();
