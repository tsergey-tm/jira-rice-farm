export const JRF_KEYS_PROJECT = "com.tsergey.jira.rice.farm.v1";
export const JRF_KEYS_ISSUE = "com.tsergey.jira.rice.farm";

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

export type JRFBoardData = {
    reachDivider: number;
    impactCategories: Array<JRFBoardDataImpactCategory>;
    confidences: Array<JRFBoardDataConfidence>;
    effortDescription: string;
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
