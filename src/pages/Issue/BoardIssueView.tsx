import './BoardIssueView.css';
import {BoardIssueEditor} from "@/pages/Issue/BoardIssueEditor.tsx";
import {type FC, type MouseEvent, useState} from "react";
import {getLocalStorageItem, setLocalStorageItem} from "@/utils/LocalStorage.ts";
import {jiraBoardDataStore} from "@/data/JiraData.ts";
import {calcRICEValues} from "@/utils/RICEUtils.ts";
import {observer} from "mobx-react-lite";
import type {JRFIssueData} from "@/types/JiraRiceFarmTypes.ts";
import {numberWithThousands} from "@/utils/FormatUtils.ts";


const keyBoardIssueViewCollapsedState = 'jira-rice-farm-board-issue-view-collapsed';

interface BoardIssueViewProps {
    issueKey: string;
}

type BoardIssueViewCollapsedState = {
    main: boolean,
    rice: boolean,
    r: boolean,
    i: boolean,
    c: boolean,
    e: boolean
}

const initBoardIssueViewCollapsedState = (): BoardIssueViewCollapsedState => {
    return {
        main: false,
        rice: false,
        r: false,
        i: false,
        c: false,
        e: false
    }
}

const getBoardIssueViewCollapsedState = (): BoardIssueViewCollapsedState => {
    const res = getLocalStorageItem<BoardIssueViewCollapsedState>(keyBoardIssueViewCollapsedState);
    return res ? res : initBoardIssueViewCollapsedState();
}

export const BoardIssueView: FC<BoardIssueViewProps> = observer(({issueKey}) => {

    const boardData = jiraBoardDataStore.jrfBoardData;

    if (!boardData.loaded || !boardData.value) {
        return <></>;
    }

    const [editorOpen, setEditorOpen] = useState(false);
    const [collapsed, _setCollapsed] = useState<BoardIssueViewCollapsedState>(() => getBoardIssueViewCollapsedState());
    const issueData: JRFIssueData | undefined = (boardData.value.issues) ? (boardData.value.issues[issueKey] || undefined) : undefined;

    const {
        riceValue,
        rValue,
        iValue,
        cValue,
        eValue
    } = issueData ? calcRICEValues(boardData.value, issueData) : {
        riceValue: null,
        rValue: null,
        iValue: null,
        cValue: null,
        eValue: null,
    };

    const toggleMainCollapsed = (event: MouseEvent<HTMLButtonElement>) => {
        // Jira can attach delegated listeners to toggle-title; block them to keep React as single source of truth.
        event.preventDefault();
        event.stopPropagation();

        _setCollapsed(prev => {
            const next = {...prev, main: !prev.main};
            setLocalStorageItem(keyBoardIssueViewCollapsedState, next);
            return next;
        });
    };

    const toggleCollapsed = (key: keyof BoardIssueViewCollapsedState) => (event: MouseEvent<HTMLButtonElement>) => {
        // Jira can attach delegated listeners to toggle-title; block them to keep React as single source of truth.
        event.preventDefault();
        event.stopPropagation();

        _setCollapsed(prev => {
            const next = {...prev, [key]: !prev[key]};
            setLocalStorageItem(keyBoardIssueViewCollapsedState, next);
            return next;
        });
    };

    return <div id="details-module"
                className={`module toggle-wrap  ghx-detail-section ${collapsed.main ? 'collapsed' : 'expanded'}`}>
        <div id="details-module_heading" className="mod-header">
            <h3 className="toggle-header" id="details-module-label">
                <button className="aui-button toggle-title" aria-label="Детали задачи"
                        aria-controls="details-module" aria-expanded={!collapsed.main}
                        onClick={toggleMainCollapsed}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                        <g fill="none" fill-rule="evenodd">
                            <path
                                d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z"
                                fill="#344563"></path>
                        </g>
                    </svg>
                    <span className="aui-toggle-header-button-label">Jira RICE farm</span></button>
            </h3>
            <ul className="ops"></ul>
        </div>
        <div className="mod-content">
            <div className="jira-rice-farm-board-issue-view-content">
                <div className="jira-rice-farm-board-issue-view-caption">
                    <button
                        className={`jira-rice-farm-board-issue-view-section-button ${collapsed.rice ? 'collapsed' : 'expanded'}`}
                        aria-label="RICE"
                        onClick={toggleCollapsed('rice')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                            <g fill="none" fill-rule="evenodd">
                                <path
                                    d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z"
                                    fill="#344563"></path>
                            </g>
                        </svg>
                    </button>
                    <div className="jira-rice-farm-board-issue-view-caption-name">
                        RICE = {numberWithThousands(riceValue)}
                    </div>
                    <div className="jira-rice-farm-board-issue-view-caption-edit-button"
                         onClick={() => setEditorOpen(true)}>
                        &#128393;
                    </div>
                </div>

                {!collapsed.rice && (
                    <>
                        <div
                            className="jira-rice-farm-board-issue-view-section jira-rice-farm-board-issue-view-section-red">
                            <button
                                className={`jira-rice-farm-board-issue-view-section-button ${collapsed.r ? 'collapsed' : 'expanded'}`}
                                aria-label="R"
                                onClick={toggleCollapsed('r')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                                    <g fill="none" fill-rule="evenodd">
                                        <path
                                            d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z"
                                            fill="#344563"></path>
                                    </g>
                                </svg>
                            </button>
                            <span
                                className="jira-rice-farm-board-issue-view-section-button-label">
                                R = {numberWithThousands(rValue)}
                            </span>

                            {!collapsed.r && issueData && (
                                <div className="jira-rice-farm-board-issue-view-subsection">
                                    <div className="jira-rice-farm-board-issue-view-subsection-item">
                                        доход = {numberWithThousands(issueData.reach.income)}
                                    </div>
                                    {issueData.reach.type === 'sample' &&
                                        <div className="jira-rice-farm-board-issue-view-subsection-item">
                                            размер = {numberWithThousands(issueData.reach.size)}
                                        </div>
                                    }
                                </div>
                            )}
                        </div>

                        <div
                            className="jira-rice-farm-board-issue-view-section jira-rice-farm-board-issue-view-section-indigo">
                            <button
                                className={`jira-rice-farm-board-issue-view-section-button ${collapsed.i ? 'collapsed' : 'expanded'}`}
                                aria-label="I"
                                onClick={toggleCollapsed('i')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                                    <g fill="none" fill-rule="evenodd">
                                        <path
                                            d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z"
                                            fill="#344563"></path>
                                    </g>
                                </svg>
                            </button>
                            <span className="jira-rice-farm-board-issue-view-section-button-label">
                                I = {numberWithThousands(iValue)}
                            </span>

                            {!collapsed.i && issueData && (
                                <div className="jira-rice-farm-board-issue-view-subsection">
                                    {Object.entries(issueData.impacts).map(([name, value]) => {
                                        const category = jiraBoardDataStore.jrfBoardData.value?.impactCategories.find(cat => cat.name === name);
                                        return (
                                            <div key={name}
                                                 className="jira-rice-farm-board-issue-view-subsection-item">
                                                {name} ({category?.names[value] || value} = {category?.values[value] || "0"})
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div
                            className="jira-rice-farm-board-issue-view-section jira-rice-farm-board-issue-view-section-cyan">
                            <button
                                className={`jira-rice-farm-board-issue-view-section-button ${collapsed.c ? 'collapsed' : 'expanded'}`}
                                aria-label="C"
                                onClick={toggleCollapsed('c')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                                    <g fill="none" fill-rule="evenodd">
                                        <path
                                            d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z"
                                            fill="#344563"></path>
                                    </g>
                                </svg>
                            </button>
                            <span
                                className="jira-rice-farm-board-issue-view-section-button-label">
                                C = {numberWithThousands(cValue)}
                            </span>

                            {!collapsed.c && issueData && (
                                <div className="jira-rice-farm-board-issue-view-subsection">
                                    <div className="jira-rice-farm-board-issue-view-subsection-item">
                                        {jiraBoardDataStore.jrfBoardData.value?.confidences.find(conf => conf.name === issueData.confidence)?.name || ''}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className="jira-rice-farm-board-issue-view-section jira-rice-farm-board-issue-view-section-emerald">
                            <button
                                className={`jira-rice-farm-board-issue-view-section-button ${collapsed.e ? 'collapsed' : 'expanded'}`}
                                aria-label="E"
                                onClick={toggleCollapsed('e')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                                    <g fill="none" fill-rule="evenodd">
                                        <path
                                            d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z"
                                            fill="#344563"></path>
                                    </g>
                                </svg>
                            </button>
                            <span
                                className="jira-rice-farm-board-issue-view-section-button-label">
                                E = {eValue ? eValue.toFixed(0) : '0'}
                            </span>

                            {!collapsed.e && issueData && (
                                <div className="jira-rice-farm-board-issue-view-subsection">
                                    <div className="jira-rice-farm-board-issue-view-subsection-item">
                                        {jiraBoardDataStore.jrfBoardData.value?.effortDescription || ''}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>

        <BoardIssueEditor issueKey={issueKey} isOpen={editorOpen} onClose={() => setEditorOpen(false)}/>
    </div>
});
