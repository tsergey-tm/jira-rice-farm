export type TabMessage = {
    type: string,
    url: string,
    boardId?: string,
    issueId?: string
}

export const TabMessageType = {
    URL_CHANGED: "JIRA_RICE_FARM_URL_CHANGED",
    BOARD_DATA_CHANGED: "JIRA_RICE_FARM_BOARD_DATA_CHANGED",
    ISSUE_DATA_CHANGED: "JIRA_RICE_FARM_ISSUE_DATA_CHANGED",
}