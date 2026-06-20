import {makeAutoObservable, observable} from 'mobx';
import type {JRFBoardData, JRFIssueData} from "@/types/JiraRiceFarmTypes.ts";
import {getBoardData, getBoardId, getIssueData, isJira} from "@/utils/JiraUtils.ts";
import {type TabMessage, TabMessageType} from "@/types/Message.ts";


export type JRFIssueDataInfo = {
    loaded: boolean;
    value: JRFIssueData | undefined;
}

export class JiraBoardDataStore {
    readonly isJira: boolean;
    readonly boardId: string | null;
    jrfBoardData: JRFBoardData | null = null;
    #jrfIssues: { [key: string]: JRFIssueDataInfo } = {};

    constructor() {
        this.isJira = isJira();
        this.boardId = getBoardId();

        if (this.boardId !== null) {
            void getBoardData(this.boardId).then(data => {
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
                            jiraBoardDataStore.forceReloadBoardInfo();
                        }
                        break;
                    case TabMessageType.ISSUE_DATA_CHANGED:
                        if (message.issueId && this.#jrfIssues[message.issueId]) {
                            console.log('[Jira RICE farm] Board data changed');
                            this.#loadIsssueData(message.issueId);
                        }
                        break;
                    default:
                        break;
                }
            });

        }
        makeAutoObservable(this);
    }

    #setBoardData(data: JRFBoardData) {
        this.jrfBoardData = {...data};
    }

    forceReloadBoardInfo = () => {
        if (this.boardId !== null) {
            void getBoardData(this.boardId).then(data => {
                if (data) {
                    this.#setBoardData(data);
                }
            });
        }
    }

    #setIssueData(key: string, value: JRFIssueData) {
        if (this.#jrfIssues[key]) {
            this.#jrfIssues[key].value = value;
        } else {
            this.#jrfIssues[key] = observable({
                loaded: true,
                value: value,
            })
        }
    }

    getIssueData(key: string) {
        if (this.boardId !== null) {
            let res: JRFIssueDataInfo | undefined = this.#jrfIssues[key];
            if (!res) {
                res = observable({
                    loaded: false,
                    value: undefined,
                })
                this.#loadIsssueData(key);
            }

            return res;
        } else {
            return {
                loaded: false,
                value: undefined,
            };
        }
    }

    #loadIsssueData(key: string) {
        if (this.boardId !== null) {
            void getIssueData(key, this.boardId).then(data => {
                if (data) {
                    this.#setIssueData(key, data);
                }
            });
        }
    }
}

export const jiraBoardDataStore = new JiraBoardDataStore();
