import type {FC} from 'react';
import {jiraBoardDataStore} from '@/data/JiraData.ts';
import {calcRICEValues} from '@/utils/RICEUtils';
import './BoardIssueCard.css';
import {observer} from "mobx-react-lite";
import type {JRFIssueData} from "@/types/JiraRiceFarmTypes.ts";
import {numberWithThousands} from "@/utils/FormatUtils.ts";

interface BoardIssueCardProps {
    issueKey: string;
    isCard: boolean;
}

export const boardIssueCardInjectedClassName = 'jira-rice-farm-board-issue-injected';

export const BoardIssueCard: FC<BoardIssueCardProps> = observer(({issueKey, isCard}) => {
    const boardData = jiraBoardDataStore.jrfBoardData;
    if (!boardData.loaded || !jiraBoardDataStore.jrfBoardData.value || !jiraBoardDataStore.jrfBoardData.value.issues) {
        return <div/>;
    }

    const issueData: JRFIssueData | undefined = jiraBoardDataStore.jrfBoardData.value.issues[issueKey] || undefined;
    if (!issueData) {
        return <div/>;
    }

    const {riceValue} = calcRICEValues(boardData.value!, issueData);

    if (isNaN(riceValue)) {
        return <div/>;
    }

    return (
        <div
            className={`${boardIssueCardInjectedClassName} jira-rice-farm-board-issue-${isCard ? 'card-rice' : 'item-rice'}`}
        >
            RICE = {numberWithThousands(riceValue)}
        </div>
    );
});