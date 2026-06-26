export const JRF_KEYS_PROJECT = "com.tsergey.jira.rice.farm.v1";

export enum JRFBoardDataImpactCategoryLevelKeys {
    None = "None",
    Low = "Low",
    Medium = "Medium",
    High = "High",
}

export type JRFBoardDataImpactCategory = {
    name: string;
    description: string;
    values: Record<JRFBoardDataImpactCategoryLevelKeys, number>;
    names: Record<JRFBoardDataImpactCategoryLevelKeys, string>;
    descriptions: Record<JRFBoardDataImpactCategoryLevelKeys, string>;
}

export type JRFBoardDataConfidence = {
    name: string;
    value: number;
}

export type JRFIssueDataReach = {
    type: 'sample' | 'money';
    income: number;
    size: number;
}

export type JRFIssueData = {
    reach: JRFIssueDataReach;
    impacts: { [name: string]: JRFBoardDataImpactCategoryLevelKeys };
    confidence: string;
    effort: number;
}

export type JRFOnlyBoardData = {
    reachDivider: number;
    impactCategories: Array<JRFBoardDataImpactCategory>;
    confidences: Array<JRFBoardDataConfidence>;
    effortDescription: string;
}

export type JRFBoardDataWithIssues = JRFOnlyBoardData & {
    issues: { [key: string]: JRFIssueData };
    type: undefined | 'data';
}

export type JRFBoardDataLink = {
    type: 'link';
    linkedBoardId: string;
}

export type JRFBoardData = JRFBoardDataWithIssues | JRFBoardDataLink;

