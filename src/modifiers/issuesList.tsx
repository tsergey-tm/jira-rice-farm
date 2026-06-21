import type {ModifyProcessor} from "./types.ts";
import {jiraBoardDataStore, type JRFBoardDataInfo} from "@/data/JiraData.ts";
import {calcRICEValues} from "@/utils/RICEUtils.ts";
import type {JRFIssueData} from "@/types/JiraRiceFarmTypes.ts";
import {BoardIssueCard, boardIssueCardInjectedClassName} from "@/pages/Issue/BoardIssueCard.tsx";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";

const headerSelector = "#ghx-content-group > div.ghx-backlog-group > div.ghx-backlog-container > div.ghx-backlog-header";
const issuesContainerSelector = "#ghx-content-group > div.ghx-backlog-group > div.ghx-backlog-container > div.ghx-issues";
const issueSelector = "div.js-issue";

const injectIssues = () => {

    const container = document.querySelector(issuesContainerSelector);
    if (!container || !(container instanceof HTMLElement)) return;

    const issueElements = Array.from(container.querySelectorAll(issueSelector));
    if (issueElements.length === 0) return;

    const boardId = jiraBoardDataStore.boardId;
    const boardData: JRFBoardDataInfo = jiraBoardDataStore.jrfBoardData;

    if (!boardId || !boardData.loaded) {
        return;
    }

    issueElements.forEach(el => {
        const key = el.getAttribute("data-issue-key");
        if (key) {
            if (el.getElementsByClassName(boardIssueCardInjectedClassName).length === 0) {
                const boardIssueInjection = document.createElement('div');
                boardIssueInjection.className = boardIssueCardInjectedClassName;
                el.append(boardIssueInjection);
                createRoot(boardIssueInjection).render(
                    <StrictMode>
                        <BoardIssueCard issueKey={key} isCard={false}/>
                    </StrictMode>
                );
            }
        }
    });
};


const reorderIssues = () => {

    const container = document.querySelector(issuesContainerSelector);
    if (!container || !(container instanceof HTMLElement)) return;

    const issueElements = Array.from(container.querySelectorAll(issueSelector));
    if (issueElements.length === 0) return;

    const issueKeys = issueElements.map(el => el.getAttribute("data-issue-key"));
    const boardId = jiraBoardDataStore.boardId;
    const boardData: JRFBoardDataInfo = jiraBoardDataStore.jrfBoardData;

    if (!boardId || !boardData.loaded) {
        return;
    }

    try {
        // Расчет и сортировка
        const issueDataMap = new Map<string, JRFIssueData>();
        issueKeys.forEach((key) => {
            if (key) {
                const data = boardData.value?.issues[key];
                if (data) {
                    issueDataMap.set(key, data);
                }
            }
        });

        const tasksWithRICE = issueElements.map(el => {
            const key = el.getAttribute("data-issue-key");
            const issueData = key ? issueDataMap.get(key) || null : null;
            const {riceValue} = calcRICEValues(boardData.value!, issueData);
            return {el, riceValue};
        });

        // Сортируем по убыванию riceValue. NaN/undefined в конец.
        tasksWithRICE.sort((a, b) => {
            const aValid = typeof a.riceValue === 'number' && !isNaN(a.riceValue);
            const bValid = typeof b.riceValue === 'number' && !isNaN(b.riceValue);

            if (aValid && bValid) {
                return b.riceValue - a.riceValue;
            } else if (aValid) {
                return -1; // a comes first
            } else if (bValid) {
                return 1; // b comes first
            } else {
                return 0;
            }
        });

        const sortedElements = tasksWithRICE.map(t => t.el);
        const allChildren = Array.from(container.children);

        let taskCounter = 0;
        for (const child of allChildren) {
            if (child.classList.contains("js-issue")) {
                const sortedTask = sortedElements[taskCounter++];
                if (sortedTask) {
                    container.insertBefore(sortedTask, child);
                }
            }
        }
    } catch (error) {
        console.error("Error during sorting:", error);
    }
};

export const modifyIssuesList: ModifyProcessor = (): boolean => {

    const header = document.querySelector(headerSelector);
    if (!header || !(header instanceof HTMLElement)) {
        return false;
    }

    // Prevent multiple buttons
    if (header.querySelector(".jira-rice-farm-sort-button")) {
        return true;
    }

    const sortButton = document.createElement("button");
    sortButton.className = "jira-rice-farm-sort-button";
    sortButton.innerHTML = "⇅"; // Simple sort icon
    sortButton.style.marginLeft = "8px";
    sortButton.style.cursor = "pointer";
    sortButton.title = "Sort by RICE value";

    header.appendChild(sortButton);

    sortButton.addEventListener("click", (ev: UIEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        reorderIssues();
    });

    injectIssues();

    return true;
};
