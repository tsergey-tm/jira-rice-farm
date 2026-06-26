import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import type {ModifyProcessor} from "./types.ts";
import {BoardIssueCard} from "@/pages/Issue/BoardIssueCard.tsx";


const boardIssueInjectionClassName = 'jira-rice-farm-board-issue-injection';

const processIssues = (): boolean => {

    const targetElements = document.querySelectorAll('div.ghx-issue[data-issue-id][data-issue-key]');

    const findElement = (targetElement: Element, className: string) => {
        const res = targetElement.getElementsByClassName(className);
        if (res.length > 1) {
            console.warn("[Jira RICE farm] Too many elements found");
            return null;
        } else if (res.length === 1) {
            return res[0];
        } else {
            return null;
        }
    }

    targetElements.forEach(el => {
        const issueKey = el.getAttribute('data-issue-key');
        if (issueKey) {
            let boardIssueInjection = findElement(el, boardIssueInjectionClassName);
            if (!boardIssueInjection) {
                const container = findElement(el, 'ghx-key');

                if (container) {
                    boardIssueInjection = document.createElement('div');
                    boardIssueInjection.className = boardIssueInjectionClassName;
                    container.append(boardIssueInjection);
                    createRoot(boardIssueInjection).render(
                        <StrictMode>
                            <BoardIssueCard issueKey={issueKey} isCard={true}/>
                        </StrictMode>
                    );
                }
            }
        }
    });

    return false;
}

export const modifyBoard: ModifyProcessor = (): boolean => {
    return processIssues();
};