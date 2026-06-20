import type {ModifyProcessor} from "./types.ts";
import {getBoardId, getIssueData} from "@/utils/JiraUtils.ts";
import {jiraBoardDataStore} from "@/data/JiraData.ts";
import {calcRICEValues} from "@/utils/RICEUtils.ts";
import type {JRFIssueData} from "@/types/JiraRiceFarmTypes.ts";

export const modifyIssuesList: ModifyProcessor = (): boolean => {
    const headerSelector = "#ghx-content-group > div.ghx-backlog-group > div.ghx-backlog-container > div.ghx-backlog-header";
    const issuesContainerSelector = "#ghx-content-group > div.ghx-backlog-group > div.ghx-backlog-container > div.ghx-issues";
    const issueSelector = "div.js-issue";

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

    sortButton.addEventListener("click", () => {
        void (async () => {
            const container = document.querySelector(issuesContainerSelector);
            if (!container || !(container instanceof HTMLElement)) return;

            const issueElements = Array.from(container.querySelectorAll(issueSelector));
            if (issueElements.length === 0) return;

            const issueKeys = issueElements.map(el => el.getAttribute("data-issue-key"));
            const boardId = getBoardId();
            const boardData = jiraBoardDataStore.jrfBoardData;

            if (!boardId || !boardData) {
                console.error("Missing boardId or boardData");
                return;
            }

            try {
                // 2. Загрузка данных задач
                const issueDataResults = await Promise.all(
                    issueKeys.map(async (key) => {
                        if (!key) return null;
                        return await getIssueData(key, boardId);
                    })
                );

                // 3. Расчет и сортировка
                const issueDataMap = new Map<string, JRFIssueData>();
                issueKeys.forEach((key, index) => {
                    const data = issueDataResults[index];
                    if (key && data) {
                        issueDataMap.set(key, data);
                    }
                });

                const tasksWithRICE = issueElements.map(el => {
                    const key = el.getAttribute("data-issue-key");
                    const issueData = key ? issueDataMap.get(key) || null : null;
                    const {riceValue} = calcRICEValues(boardData, issueData);
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
        })();
    });

    return true;
};
