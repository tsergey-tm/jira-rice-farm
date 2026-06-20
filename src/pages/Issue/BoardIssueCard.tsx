import type {FC} from 'react';
import {jiraBoardDataStore} from '@/data/JiraData.ts';
import {calcRICEValues} from '@/utils/RICEUtils';
import './BoardIssueCard.css';
import {observer} from "mobx-react-lite";

interface BoardIssueCardProps {
    issueKey: string;
}

export const BoardIssueCard: FC<BoardIssueCardProps> = observer(({issueKey}) => {
    const boardData = jiraBoardDataStore.jrfBoardData;
    const issueData = jiraBoardDataStore.getIssueData(issueKey);

    if (!issueData.loaded || !boardData) {
        return <div/>;
    }

    const {riceValue} = calcRICEValues(boardData, issueData.value!);

    if (isNaN(riceValue)) {
        return <div/>;
    }

    return (
        <div
            className="jira-rice-farm-board-issue-card-rice"
        >
            RICE = {riceValue}
        </div>
    );
});