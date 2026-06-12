/**
 * Записывает данные в локальное хранилище
 * @param key - ключ для хранения данных
 * @param data - данные для сохранения
 */
export const setLocalStorageItem = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Ошибка при записи в localStorage с ключом ${key}:`, error);
    }
};

/**
 * Читает данные из локального хранилища
 * @param key - ключ для чтения данных
 * @returns Данные из хранилища или null, если ключ не найден
 */
export const getLocalStorageItem = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return null;
        }
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`Ошибка при чтении из localStorage с ключом ${key}:`, error);
        return null;
    }
};

/**
 * Удаляет данные из локального хранилища
 * @param key - ключ для удаления данных
 */
export const removeLocalStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Ошибка при удалении из localStorage с ключом ${key}:`, error);
    }
};