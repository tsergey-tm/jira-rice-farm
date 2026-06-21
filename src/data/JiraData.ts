import {makeAutoObservable} from 'mobx';
import type {JRFBoardData, JRFIssueData, JRFOnlyBoardData} from "@/types/JiraRiceFarmTypes.ts";
import {getBoardId, isJira} from "@/utils/JiraUtils.ts";
import {type TabMessage, TabMessageType} from "@/types/Message.ts";
import {jiraDataSaverLoad, jiraDataSaverSave} from "@/data/JiraDataSaver.ts";


export type JRFBoardDataInfo = {
    loaded: boolean;
    value: JRFBoardData | undefined;
}

export class JiraBoardDataStore {
    readonly isJira: boolean;
    readonly boardId: string | null;
    jrfBoardData: JRFBoardDataInfo = {loaded: false, value: undefined};

    constructor() {
        this.isJira = isJira();
        this.boardId = getBoardId();

        if (this.boardId !== null) {
            void jiraDataSaverLoad(this.boardId).then(data => {
                if (data) {
                    this.#setBoardData(data);
                }
            });

            // Register listener fo messages
            chrome.runtime.onMessage.addListener((message: TabMessage) => {
                switch (message.type) {
                    case TabMessageType.BOARD_DATA_CHANGED:
                        if (message.boardId === this.boardId) {

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

    forceReloadBoardInfo = async (): Promise<JRFBoardDataInfo | null> => {
        if (this.boardId !== null) {
            const data = await this.getFreshBoardInfo();
            if (data) {
                this.#setBoardData(data.value);
            }
            return data;
        } else {
            return Promise.resolve(null);
        }
    }

    getFreshBoardInfo = async (): Promise<JRFBoardDataInfo | null> => {
        if (this.boardId !== null) {
            const data = await jiraDataSaverLoad(this.boardId);
            return {loaded: true, value: data || undefined};
        } else {
            return Promise.resolve(null);
        }
    }

    modifyBoardDataAndSave = async (newValues: JRFOnlyBoardData) => {
        if (this.boardId === null) {
            return;
        }

        const bd: JRFBoardDataInfo | null = await this.getFreshBoardInfo();

        let data: JRFBoardData | null = bd?.value || null;

        if (data === null) {
            data = {
                ...newValues,
                issues: {}
            }
        } else {
            data = {
                ...newValues,
                issues: data.issues
            }
        }

        await jiraDataSaverSave(this.boardId, data).then(() => this.forceReloadBoardInfo());
    }

    modifyIssueDataAndSave = async (issueKey: string, newValues: JRFIssueData) => {
        if (this.boardId === null) {
            return;
        }

        const data: JRFBoardDataInfo | null = await this.getFreshBoardInfo();
        if (!data || !data.value) {
            throw new Error(`Board data empty, fill it first`);
        } else {
            if (!data.value.issues) {
                data.value.issues = {};
            }
            data.value.issues[issueKey] = newValues;
            await jiraDataSaverSave(this.boardId, data.value).then(() => this.forceReloadBoardInfo());
        }
    }

}

export const jiraBoardDataStore = new JiraBoardDataStore();
