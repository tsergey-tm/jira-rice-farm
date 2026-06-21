import {JRF_KEYS_PROJECT, type JRFBoardData} from "@/types/JiraRiceFarmTypes.ts";


type JiraPropertyHolder<T> = {
    key: string;
    value: T;
}

/**
 * Получение данных доски из Jira properties
 */
const loadBoardData = async (boardId: string): Promise<JRFBoardData | null> => {
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
const saveBoardData = async (boardId: string, data: JRFBoardData): Promise<void> => {
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

export const jiraDataSaverLoad = async (boardId: string): Promise<JRFBoardData | null> => {
    return await loadBoardData(boardId);
}

export const jiraDataSaverSave = async (boardId: string, newValue: JRFBoardData) => {
    return await saveBoardData(boardId, newValue);
}


