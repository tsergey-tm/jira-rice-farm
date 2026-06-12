import type {JRFBoardData, JRFIssueData} from '@/types/JiraRiceFarmTypes.ts';
import {JRF_KEYS_ISSUE, JRF_KEYS_PROJECT} from '@/types/JiraRiceFarmTypes.ts';

export const Routes = {
    BOARD: 'BOARD',
    SETTINGS: 'SETTINGS',
    SEARCH: 'SEARCH',
    REPORTS: 'REPORTS',
    ISSUE: 'ISSUE',
    ALL: 'ALL',
    NONE: 'NONE',
};

type JiraPropertyHolder<T> = {
    key: string;
    value: T;
}

export const isJira = () => {
    return document.body.id === 'jira';
}

export const getCurrentRoute = (url: string | undefined) => {
    const _url: URL | Location = url ? new URL(url) : window.location;
    const {pathname, search} = _url;
    const params = new URLSearchParams(search);

    if (pathname.includes('RapidView.jspa')) return Routes.SETTINGS;

    if (pathname.includes('RapidBoard.jspa')) {
        if (params.get('config')) return Routes.SETTINGS;
        if (params.get('view') === 'reporting') return Routes.REPORTS;

        return Routes.BOARD;
    }
    if (pathname.startsWith('/browse')) {
        return params.get('jql') ? Routes.SEARCH : Routes.ISSUE;
    }

    return Routes.NONE;
};

export const getBoardId = (): string | null => {
    // Получаем boardId из URL
    const {pathname, search} = window.location;
    const params = new URLSearchParams(search);

    if (pathname.includes('RapidView.jspa') || pathname.includes('RapidBoard.jspa')) {
        return params.get('rapidView');
    }
    return null;
}

/**
 * Получение данных доски из Jira properties
 */
export const getBoardData = async (boardId: string): Promise<JRFBoardData | null> => {
    try {
        const response = await fetch(`/rest/agile/1.0/board/${boardId}/properties/${JRF_KEYS_PROJECT}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // Данные не найдены
            }
            throw new Error(`Failed to fetch board data: ${response.status} ${response.statusText}`);
        }

        return await response.json().then(json => (json as JiraPropertyHolder<JRFBoardData>).value);
    } catch (error) {
        console.error('Error fetching board data:', error);
        throw error;
    }
};

/**
 * Запись данных доски в Jira properties
 */
export const setBoardData = async (boardId: string, data: JRFBoardData): Promise<void> => {
    try {
        const response = await fetch(`/rest/agile/1.0/board/${boardId}/properties/${JRF_KEYS_PROJECT}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to set board data: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error setting board data:', error);
        throw error;
    }
};

export const getIssueDataKey = (boardId: string): string => {
    return `${JRF_KEYS_ISSUE}.${boardId}.v1`;
};

/**
 * Получение данных задачи из Jira properties
 */
export const getIssueData = async (issueIdOrKey: string, boardId: string): Promise<JRFIssueData | null> => {
    try {
        const response = await fetch(`/rest/api/2/issue/${issueIdOrKey}/properties/${getIssueDataKey(boardId)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // Данные не найдены
            }
            throw new Error(`Failed to fetch issue data: ${response.status} ${response.statusText}`);
        }

        return await response.json().then(json => (json as JiraPropertyHolder<JRFIssueData>).value);
    } catch (error) {
        console.error('Error fetching issue data:', error);
        throw error;
    }
};

/**
 * Запись данных задачи в Jira properties
 */
export const setIssueData = async (issueIdOrKey: string, data: JRFIssueData, boardId: string): Promise<void> => {
    try {
        const response = await fetch(`/rest/api/2/issue/${issueIdOrKey}/properties/${getIssueDataKey(boardId)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to set issue data: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error setting issue data:', error);
        throw error;
    }
};
