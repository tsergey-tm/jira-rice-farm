# Задача: Привязка данных задачи к ID доски

## Описание

В данный момент данные задачи (`JRFIssueData`) хранятся в Jira под единым ключом, что приводит к конфликтам, если одна и
та же задача может рассматриваться в контексте разных досок (или просто для обеспечения корректной изоляции данных).
Необходимо изменить механизм чтения и сохранения данных задачи так, чтобы ключ хранения зависел от `boardId`.

Формат ключа: `com.tsergey.jira.rice.farm.<boardId>.v1`

## План реализации

### 1. Изменение типов и констант

- В файле `src/types/JiraRiceFarmTypes.ts` замени константу `JRF_KEYS_ISSUE` на `com.tsergey.jira.rice.farm`.

### 2. Обновление утилит (`src/utils/JiraUtils.ts`)

- Добавить вспомогательную функцию `getIssueDataKey(boardId: string): string`, которая возвращает строку в формате
  `${JRF_KEYS_ISSUE}.${boardId}.v1`.
- Обновить сигнатуру функции `getIssueData`:
    - Было: `getIssueData(issueIdOrKey: string): Promise<JRFIssueData | null>`
    - Стало: `getIssueData(issueIdOrKey: string, boardId: string): Promise<JRFIssueData | null>`
    - Внутри использовать `getIssueDataKey(boardId)` вместо старой константы.
- Обновить сигнатуру функции `setIssueData`:
    - Было: `setIssueData(issueIdOrKey: string, data: JRFIssueData): Promise<void>`
    - Стало: `setIssueData(issueIdOrKey: string, data: JRFIssueData, boardId: string): Promise<void>`
    - Внутри использовать `getIssueDataKey(boardId)`.

### 3. Обновление компонентов интерфейса

#### `src/pages/Issue/BoardIssueView.tsx`

- Внутри `useEffect`, который отвечает за загрузку данных, получить `boardId` с помощью `getBoardId()`.
- Передать полученный `boardId` в функцию `getIssueData(issueKey, boardId)`.

#### `src/pages/Issue/BoardIssueCard.tsx`

- Внутри `useEffect`, который отвечает за загрузку данных, получить `boardId` с помощью `getBoardId()`.
- Передать полученный `boardId` в функцию `getIssueData(issueKey, boardId)`.

#### `src/pages/Issue/BoardIssueEditor.tsx`

- Компонент уже имеет переменную `const boardId = getBoardId();`.
- В функции `loadIssueData` (внутри `useEffect`) передать `boardId` в `getIssueData(issueKey, boardId)`.
- В функции `handleSave` передать `boardId` в `setIssueData(issueKey, formData, boardId)`.

## Критерии успеха

1. Проект компилируется без ошибок TypeScript (`npm run typecheck`).
2. Линтер не выдает ошибок (`npm run lint`).
3. При открытии задачи на доске с `boardId = "123"`, данные загружаются по ключу `com.tsergey.jira.rice.farm.123.v1`.
4. При сохранении данных в редакторе, они записываются по соответствующему ключу доски.
