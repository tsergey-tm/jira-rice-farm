import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import type {ModifyProcessor} from "./types.ts";
import {BoardInjectedIcon} from "@/pages/Board/BoardInjectedIcon.tsx";
import {BoardIssueView} from "@/pages/Issue/BoardIssueView.tsx";
import {BoardIssueCard} from "@/pages/Issue/BoardIssueCard.tsx";


const iconInjectionId = 'jira-rice-farm-icon';
const issueContainerId = 'js-detail-nav-content';
const issueContainerIssueId = 'ghx-detail-issue';
const selectedIssueInjectionId = 'jira-rice-farm-board-selected-issue-injection';
const boardIssueInjectionClassName = 'jira-rice-farm-board-issue-injection';

const findContainer = (): Element | null => {
    const elementsByClassName = document.getElementsByClassName('aui-sidebar-body');
    if (elementsByClassName.length > 1) {
        console.warn("[Jira RICE farm] Too many containers found");
        return null;
    } else if (elementsByClassName.length === 1) {
        return elementsByClassName.item(0);
    } else {
        return null;
    }
}

const processBoardIcon = () => {
    const container = findContainer();
    const icon = document.getElementById(iconInjectionId)

    let isChanged = false;

    if (!!container && !icon) {

        const div = document.createElement('div');
        div.id = iconInjectionId;
        div.className = 'jira-rice-farm-icon';

        container.append(div);
        createRoot(div).render(
            <StrictMode>
                <BoardInjectedIcon/>
            </StrictMode>
        );
        isChanged = true;
    }
    return isChanged;
};

const processSelectedIssue = () => {
    const issueContainer = document.getElementById(issueContainerId);
    const issueIdContainer = document.getElementById(issueContainerIssueId);

    if (issueContainer && issueIdContainer) {
        let issueInjection = document.getElementById(selectedIssueInjectionId);
        const issueKey = document.getElementById(issueContainerIssueId)?.getAttribute('data-issuekey');
        if (!issueInjection && !!issueKey) {
            const details = document.getElementById("DETAILS");

            issueInjection = document.createElement('div');
            issueInjection.className = 'jira-rice-farm-issue-injection';
            issueInjection.id = selectedIssueInjectionId;

            if (details) {
                details.after(issueInjection)
            } else {
                issueContainer.prepend(issueInjection);
            }
            createRoot(issueInjection).render(
                <StrictMode>
                    <BoardIssueView issueKey={issueKey}/>
                </StrictMode>
            );
            return true;
        }
    }
    return false;
};

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
                const container = findElement(el, 'ghx-issue-fields');

                if (container) {
                    boardIssueInjection = document.createElement('div');
                    boardIssueInjection.className = boardIssueInjectionClassName;
                    container.append(boardIssueInjection);
                    createRoot(boardIssueInjection).render(
                        <StrictMode>
                            <BoardIssueCard issueKey={issueKey}/>
                        </StrictMode>
                    );
                }
            }
        }
    });

    return false;
}

export const modifyBoard: ModifyProcessor = (): boolean => {
    let isChanged = processBoardIcon();
    isChanged = processSelectedIssue() || isChanged;
    isChanged = processIssues() || isChanged;

    return isChanged;
};