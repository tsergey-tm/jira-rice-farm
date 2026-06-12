import type {FC} from 'react';
import {useEffect, useState} from 'react';
import {getBoardId, getIssueData} from '@/utils/JiraUtils';
import {jiraBoardDataStore} from '@/data/JiraBoardData';
import {calcRICEValues} from '@/utils/RICEUtils';
import type {JRFIssueData} from '@/types/JiraRiceFarmTypes';
import './BoardIssueCard.css';
import {observer} from "mobx-react-lite";

interface BoardIssueCardProps {
    issueKey: string;
}

export const BoardIssueCard: FC<BoardIssueCardProps> = observer(({issueKey}) => {
    const [issueData, setIssueData] = useState<JRFIssueData | null>(null);
    const boardData = jiraBoardDataStore.jrfBoardData;

    useEffect(() => {
        if (boardData) {
            const boardId = getBoardId();
            if (boardId) {
                void getIssueData(issueKey, boardId).then((data) => {
                    setIssueData(data);
                });
            }
        }
    }, [issueKey, boardData]);

    if (!issueData || !boardData) {
        return <div/>;
    }

    const {riceValue} = calcRICEValues(boardData, issueData);

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