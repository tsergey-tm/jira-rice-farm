import type {JRFIssueData, JRFOnlyBoardData} from "@/types/JiraRiceFarmTypes.ts";

export function calcRICEValues(boardData: JRFOnlyBoardData | null, issueData: JRFIssueData | null): {
    riceValue: number,
    rValue: number,
    iValue: number,
    cValue: number,
    eValue: number
} {

    if (!issueData || !boardData) {
        return {
            riceValue: NaN,
            rValue: NaN,
            iValue: NaN,
            cValue: NaN,
            eValue: NaN
        };
    }

    const reachDivider = boardData?.reachDivider ?? 1;

    const rValue = issueData && boardData && reachDivider !== 0
        ? issueData.reach.type === 'sample'
            ? (issueData.reach.income * issueData.reach.size) / reachDivider
            : issueData.reach.income / reachDivider
        : 0;

    const iValue = issueData && boardData
        ? Object.entries(issueData.impacts).reduce((sum, [name, value]) => {
            const category = boardData.impactCategories.find(cat => cat.name === name);
            return sum + (category ? category.values[value] : 0);
        }, 0)
        : 0;

    const cValue = issueData && boardData
        ? boardData.confidences.find(conf => conf.name === issueData.confidence)?.value ?? 0
        : 0;

    const eValue = issueData?.effort ?? 1;

    const riceValue = (rValue * iValue * cValue) / eValue;
    return {riceValue, rValue, iValue, cValue, eValue};
}