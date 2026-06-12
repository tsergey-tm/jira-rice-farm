# Jira RICE farm

Плагин для Google Chrome для рассчёта веса задачи по технологии близкой к RICE.

# Принципы работы

Данные хранятся на каждой доске.
Оценка каждой задачи хранится в задаче.

# Данные

## Данные доски

Хранение данных на доске.

* получение списка ключей
  GET /rest/agile/1.0/board/{boardId}/properties
  [документация](https://docs.atlassian.com/jira-software/REST/9.12.30/#agile/1.0/board/{boardId}/properties-getPropertiesKeys)
* получение значения ключа
  GET /rest/agile/1.0/board/{boardId}/properties/{propertyKey}
  [документация](https://docs.atlassian.com/jira-software/REST/9.12.30/#agile/1.0/board/{boardId}/properties-getProperty)
* запись значения
  PUT /rest/agile/1.0/board/{boardId}/properties/{propertyKey}
  [документация](https://docs.atlassian.com/jira-software/REST/9.12.30/#agile/1.0/board/{boardId}/properties-setProperty)

## Данные задачи

* получение списка ключей
  GET /rest/api/2/issue/{issueIdOrKey}/properties
  [документация](https://docs.atlassian.com/software/jira/docs/api/REST/9.12.30/#api/2/issue/{issueIdOrKey}/properties-getPropertiesKeys)
* получение значения ключа
  GET /rest/api/2/issue/{projectIdOrKey}/properties/{propertyKey}
  [документация](https://docs.atlassian.com/software/jira/docs/api/REST/9.12.30/#api/2/issue/{issueIdOrKey}/properties-getProperty)
* запись значения
  PUT /rest/api/2/issue/{projectIdOrKey}/properties/{propertyKey}
  [документация](https://docs.atlassian.com/software/jira/docs/api/REST/9.12.30/#api/2/issue/{issueIdOrKey}/properties-setProperty)

## Типы и константы

Ключ для записи данных JRF_KEYS_PROJECT

Структура данных в src/types/JiraRiceFarmTypes.ts :

* JRFBoardData - для данных проекта
* JRFIssueData - для данных задачи

# Работа плагина

Плагин ижектирует элементы на экраны jira.
Определение экрана jira идёт по url страницы и по наличию в body идентификатора jira

# Формулы расчёта значения

Общая оценка RICE = R*I*C/E

Охват: R = (JRFIssueData.reach.type === 'sample')?
(JRFIssueData.reach.income*JRFIssueData.reach.size/JRFBoardData.reachDivider):
(JRFIssueData.reach.income/JRFBoardData.reachDivider)

Воздействие: I = sum(JRFIssueData.impacts.forEach((name, value)=>JRFBoardData.impactCategories[name].values[value])

Уверенность: C = JRFBoardData.confidences[JRFIssueData.confidence].value

Сложность: E = JRFIssueData.effort
