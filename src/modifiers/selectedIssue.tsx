import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import type {ModifyProcessor} from "./types.ts";
import {BoardIssueView} from "@/pages/Issue/BoardIssueView.tsx";


const issueContainerId = 'js-detail-nav-content';
const issueContainerIssueId = 'ghx-detail-issue';
const selectedIssueInjectionId = 'jira-rice-farm-board-selected-issue-injection';


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

export const modifySelectedIssue: ModifyProcessor = (): boolean => {
    return processSelectedIssue();
};