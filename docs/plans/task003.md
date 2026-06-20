# Задание на реализацию RICE-анализа

## Цель

Реализовать расчет и отображение данных RICE в форме src/pages/Issue/BoardIssueView.tsx в блоке mod-content вместо блока
jira-rice-farm-board-issue-view-caption.

## Требования

### 1. Структура отображения

- Кнопка редактирования должна быть на уровне 1. RICE
- В блоке mod-content должны отображаться следующие данные:

#### 1. RICE = (значение)

#### 2. R = (значение)

##### 2.1. доход = (значение)

##### 2.2. размер = (значение)

#### 3. I = (значение)

##### 3.x. name (names=value)

#### 4. C = (значение)

##### 4.1. name

#### 5. E = (значение)

### 2. Сворачиваемость блоков

- Каждый подблок должен быть сворачиваемым так же как BoardIssueViewCollapsedState.main
- Для каждого подблока должна появиться своя переменная в BoardIssueViewCollapsedState
- По умолчанию все блоки развёрнуты

### 3. Формулы расчета

- Общая оценка RICE = R*I*C/E
- Охват: R = (JRFIssueData.reach.type === 'sample')?
  (JRFIssueData.reach.income*JRFIssueData.reach.size/JRFBoardData.reachDivider):
  (JRFIssueData.reach.income/JRFBoardData.reachDivider)
- Воздействие: I = sum(JRFIssueData.impacts.forEach((name, value)=>JRFBoardData.impactCategories[name].values[value])
- Уверенность: C = JRFBoardData.confidences[JRFIssueData.confidence].value
- Сложность: E = JRFIssueData.effort

### 4. Реализация

1. Добавить новые переменные сворачивания в тип BoardIssueViewCollapsedState
2. Реализовать расчет значений RICE по формулам
3. Отобразить данные в блоке mod-content
4. Реализовать сворачивание/разворачивание для каждого подблока. При этом учесть необходимость прерывать обработку
   события как это сделано в toggleMainCollapsed
5. Убедиться, что кнопка редактирования находится на уровне 1. RICE
6. Данные задачи получить из getIssueData в src/utils/JiraUtils.ts
7. Данные доски получить из jiraBoardDataStore в src/data/JiraData.ts, это уже с useState и не надо их загружать

### 5. Требования к коду

- Использовать существующие типы данных из JiraRiceFarmTypes.ts
- Сохранять состояние сворачивания в localStorage
- Поддерживать совместимость с существующим кодом