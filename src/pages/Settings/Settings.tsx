import {type ChangeEvent, type FC, type UIEvent, useEffect, useMemo, useState} from "react";
import Modal from "react-modal";
import {type JRFBoardData, JRFBoardDataImpactCategoryLevelKeys} from "@/types/JiraRiceFarmTypes.ts";
import './Settings.css';
import {getBoardData, getBoardId, setBoardData} from "@/utils/JiraUtils.ts";

Modal.setAppElement('#jira')

const impactLevelKeys: Array<JRFBoardDataImpactCategoryLevelKeys> = Object.values(JRFBoardDataImpactCategoryLevelKeys);

type CategoryField =
    | 'name'
    | 'description'
    | `names.${JRFBoardDataImpactCategoryLevelKeys}`
    | `descriptions.${JRFBoardDataImpactCategoryLevelKeys}`
    | `values.${JRFBoardDataImpactCategoryLevelKeys}`;

function createEmptyCategory() {
    return {
        name: "Категория 1",
        description: "Описание категории 1",
        values: {
            [JRFBoardDataImpactCategoryLevelKeys.None]: 0,
            [JRFBoardDataImpactCategoryLevelKeys.Low]: 1,
            [JRFBoardDataImpactCategoryLevelKeys.Medium]: 2,
            [JRFBoardDataImpactCategoryLevelKeys.High]: 3
        },
        names: {
            [JRFBoardDataImpactCategoryLevelKeys.None]: "Отсутствует",
            [JRFBoardDataImpactCategoryLevelKeys.Low]: "Низкий",
            [JRFBoardDataImpactCategoryLevelKeys.Medium]: "Умеренный",
            [JRFBoardDataImpactCategoryLevelKeys.High]: "Высокий"
        },
        descriptions: {
            [JRFBoardDataImpactCategoryLevelKeys.None]: "",
            [JRFBoardDataImpactCategoryLevelKeys.Low]: "",
            [JRFBoardDataImpactCategoryLevelKeys.Medium]: "",
            [JRFBoardDataImpactCategoryLevelKeys.High]: ""
        }
    };
}

function initFormData(): JRFBoardData {
    return {
        reachDivider: 100,
        impactCategories: [
            createEmptyCategory(),
        ],
        confidences: [
            {name: "Эротическая фантазия", value: 0},
            {name: "Экспертная оценка одного человека", value: 1},
            {name: "Результаты опроса клиентов", value: 1},
            {name: "Экспертная оценка группы людей", value: 2},
            {name: "Результаты исследования/интервью с клиентами", value: 2},
            {name: "Нормативные изменения", value: 3},
        ],
        effortDescription: "Время разработки в неделях"
    };
}

const validateFormData = (formData: JRFBoardData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.reachDivider || formData.reachDivider < 1 || formData.reachDivider > 1000000) {
        newErrors.reachDivider = "Делитель для Reach должен быть положительным числом от 1 до 1_000_000";
    }

    if (!formData.impactCategories || formData.impactCategories.length < 1 || formData.impactCategories.length > 10) {
        newErrors.impactCategories = "Количество категорий должно быть от 1 до 10";
    } else {
        // Проверка уникальности name во всём массиве impactCategories
        const impactCategoryNames = formData.impactCategories.map(category => category.name);
        impactCategoryNames.forEach((name, index) => {
            if (impactCategoryNames.indexOf(name) !== index) {
                newErrors[`impactCategories.${index}.name`] = "Все категории должны иметь уникальные имена";
            }
        });

        formData.impactCategories.forEach((category, index) => {
            if (!category.name?.trim()) {
                newErrors[`impactCategories.${index}.name`] = "Имя категории не может быть пустым";
            }
            if (!category.description?.trim()) {
                newErrors[`impactCategories.${index}.description`] = "Описание категории не может быть пустым";
            }

            // Проверка уникальности names[] в рамках одного элемента impactCategories
            const levelNames = Object.values(category.names);
            levelNames.forEach((name, i) => {
                if (levelNames.indexOf(name) !== i) {
                    newErrors[`impactCategories.${index}.names.`] = "Все имена уровней в категории должны быть уникальными";
                }
            });

            impactLevelKeys.forEach((levelKey) => {
                if (!category.names[levelKey]?.trim()) {
                    newErrors[`impactCategories.${index}.names.${levelKey}`] = "Имя уровня не может быть пустым";
                }
                impactLevelKeys.forEach((levelKey1) => {
                    if ((levelKey !== levelKey1) &&
                        (category.names[levelKey] === category.names[levelKey1])) {
                        newErrors[`impactCategories.${index}.names.${levelKey}`] = "Все имена уровней в категории должны быть уникальными";
                    }
                });
                if (!category.descriptions[levelKey]?.trim()) {
                    newErrors[`impactCategories.${index}.descriptions.${levelKey}`] = "Описание уровня не может быть пустым";
                }
                if (typeof category.values[levelKey] !== 'number' ||
                    category.values[levelKey] < 0 ||
                    category.values[levelKey] > 100) {
                    newErrors[`impactCategories.${index}.values.${levelKey}`] = "Значение уровня должно быть от 0 до 100";
                }
            });
        });
    }

    if (!formData.confidences || formData.confidences.length < 1 || formData.confidences.length > 10) {
        newErrors.confidences = "Количество уверенностей должно быть от 1 до 10";
    } else {
        // Проверка уникальности confidences[].name
        const confidenceNames = formData.confidences.map(confidence => confidence.name);

        formData.confidences.forEach((confidence, index) => {
            if (!confidence.name?.trim()) {
                newErrors[`confidences.${index}.name`] = "Имя уверенности не может быть пустым";
            }
            if (confidenceNames.indexOf(confidence.name) !== index) {
                newErrors[`confidences.${index}.name`] = "Все названия уверенностей должны быть уникальными";
            }
            if (typeof confidence.value !== 'number' ||
                confidence.value < 0 ||
                confidence.value > 100) {
                newErrors[`confidences.${index}.value`] = "Значение уверенности должно быть от 0 до 100";
            }
        });
    }

    if (!formData.effortDescription?.trim()) {
        newErrors.effortDescription = "Описание усилий не может быть пустым";
    }

    return newErrors;
};

export const Settings: FC = () => {
    const [showSettings, setShowSettings] = useState(false);
    const [formData, setFormData] = useState<JRFBoardData>({
        reachDivider: 1,
        impactCategories: [],
        confidences: [],
        effortDescription: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const boardId = getBoardId();

    // Загрузка данных из Jira
    useEffect(() => {
        if (!showSettings) return;

        const loadSettings = async () => {
            setIsLoading(true);
            try {
                if (!boardId) {
                    throw new Error("Не удалось получить boardId");
                }

                const data = await getBoardData(boardId);
                if (data) {
                    setFormData(data);
                } else {
                    // Если данных нет, используем значения по умолчанию
                    setFormData(initFormData());
                }
            } catch (error) {
                console.error("Ошибка загрузки настроек:", error);
                // В случае ошибки используем значения по умолчанию
                setFormData(initFormData());
            } finally {
                setIsLoading(false);
            }
        };

        void loadSettings();
    }, [boardId, showSettings]);

    // Функция открытия с остановкой всплытия (на случай, если Jira перехватывает ссылки)
    const handleOpen = (e: UIEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowSettings(true);
    };

    // Функция закрытия с обязательной остановкой всплытия
    const handleClose = (e?: UIEvent, save?: boolean) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (save) {
            void handleSave();
        }
        setShowSettings(false);
    };

    const errors = useMemo(() => validateFormData(formData), [formData]);
    const isSaveButtonDisabled = Object.keys(errors).length > 0 || isSaving;

    const handleSave = async () => {
        const currentErrors = validateFormData(formData);
        if (Object.keys(currentErrors).length > 0) return;

        setIsSaving(true);
        try {
            if (!boardId) {
                throw new Error("Не удалось получить boardId");
            }

            await setBoardData(boardId, formData);
        } catch (error) {
            console.error("Ошибка сохранения настроек:", error);
            alert("Ошибка при сохранении настроек");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReachDividerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setFormData({
            ...formData,
            reachDivider: isNaN(value) ? 0 : value
        });
    };

    const handleEffortDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            effortDescription: e.target.value
        });
    };

    const handleCategoryChange = (index: number, field: CategoryField, value: string) => {
        const updatedCategories = [...formData.impactCategories];

        if (field === 'name' || field === 'description') {
            updatedCategories[index] = {
                ...updatedCategories[index],
                [field]: value
            };
        } else if (field.startsWith('values.')) {
            const levelKey = field.split('.')[1] as JRFBoardDataImpactCategoryLevelKeys;
            const parsedValue = parseInt(value, 10);
            updatedCategories[index] = {
                ...updatedCategories[index],
                values: {
                    ...updatedCategories[index].values,
                    [levelKey]: isNaN(parsedValue) ? 0 : parsedValue
                }
            };
        } else if (field.startsWith('names.')) {
            const levelKey = field.split('.')[1] as JRFBoardDataImpactCategoryLevelKeys;
            updatedCategories[index] = {
                ...updatedCategories[index],
                names: {
                    ...updatedCategories[index].names,
                    [levelKey]: value
                }
            };
        } else {
            const levelKey = field.split('.')[1] as JRFBoardDataImpactCategoryLevelKeys;
            updatedCategories[index] = {
                ...updatedCategories[index],
                descriptions: {
                    ...updatedCategories[index].descriptions,
                    [levelKey]: value
                }
            };
        }

        setFormData({
            ...formData,
            impactCategories: updatedCategories
        });
    };

    const handleConfidenceChange = (index: number, field: 'name' | 'value', value: string) => {
        const updatedConfidences = [...formData.confidences];
        if (field === 'name') {
            updatedConfidences[index] = {
                ...updatedConfidences[index],
                name: value
            };
        } else {
            const parsedValue = parseInt(value, 10);
            updatedConfidences[index] = {
                ...updatedConfidences[index],
                value: isNaN(parsedValue) ? 0 : parsedValue
            };
        }
        setFormData({
            ...formData,
            confidences: updatedConfidences
        });
    };

    const addCategory = () => {
        setFormData({
            ...formData,
            impactCategories: [
                ...formData.impactCategories,
                createEmptyCategory()
            ]
        });
    };

    const addConfidence = () => {
        setFormData({
            ...formData,
            confidences: [
                ...formData.confidences,
                {name: "", value: 0}
            ]
        });
    };

    const removeCategory = (index: number) => {
        if (formData.impactCategories.length <= 1) return;
        const updatedCategories = [...formData.impactCategories];
        updatedCategories.splice(index, 1);
        setFormData({
            ...formData,
            impactCategories: updatedCategories
        });
    };

    const removeConfidence = (index: number) => {
        if (formData.confidences.length <= 1) return;
        const updatedConfidences = [...formData.confidences];
        updatedConfidences.splice(index, 1);
        setFormData({
            ...formData,
            confidences: updatedConfidences
        });
    };

    return <a onClick={handleOpen}>
        Jira RICE farm
        <Modal
            isOpen={showSettings}
            onRequestClose={(e) => handleClose(e)}
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
            className={"jira-rice-farm-settings-modal"}
            overlayClassName={"jira-rice-farm-settings-overlay"}
        >
            <h1>Настройки Jira RICE farm</h1>

            {isLoading ? (
                <p>Загрузка данных...</p>
            ) : (
                <div className="jira-rice-farm-settings-form">
                    {/* Делитель для Reach */}
                    <div
                        className={`jira-rice-farm-settings-form-group ${errors.reachDivider ? 'jira-rice-farm-settings-error' : ''}`}>
                        <label htmlFor="reachDivider">Делитель для Reach</label>
                        <input
                            id="reachDivider"
                            type="number"
                            value={formData.reachDivider}
                            onChange={handleReachDividerChange}
                            min="1"
                            max="1000000"
                        />
                        {errors.reachDivider &&
                            <span className="jira-rice-farm-settings-error-message">{errors.reachDivider}</span>}
                    </div>

                    {/* Блок категорий Impact */}
                    <div className="jira-rice-farm-settings-form-group">
                        <h2>Категории Impact</h2>
                        {formData.impactCategories?.map((category, index) => (
                            <div key={index} className="jira-rice-farm-settings-category-block">
                                <div
                                    className={`jira-rice-farm-settings-form-group ${errors[`impactCategories.${index}.name`] ? 'jira-rice-farm-settings-error' : ''}`}>
                                    <label htmlFor={`category-name-${index}`}>Имя категории</label>
                                    <input
                                        id={`category-name-${index}`}
                                        type="text"
                                        value={category.name}
                                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                                    />
                                    {errors[`impactCategories.${index}.name`] && (
                                        <span
                                            className="jira-rice-farm-settings-error-message">{errors[`impactCategories.${index}.name`]}</span>
                                    )}
                                </div>

                                <div
                                    className={`jira-rice-farm-settings-form-group ${errors[`impactCategories.${index}.description`] ? 'jira-rice-farm-settings-error' : ''}`}>
                                    <label htmlFor={`category-description-${index}`}>Описание категории</label>
                                    <textarea
                                        id={`category-description-${index}`}
                                        value={category.description}
                                        onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                                    />
                                    {errors[`impactCategories.${index}.description`] && (
                                        <span
                                            className="jira-rice-farm-settings-error-message">{errors[`impactCategories.${index}.description`]}</span>
                                    )}
                                </div>

                                <h3>Уровни</h3>
                                {impactLevelKeys?.map((levelKey) => (
                                    <div key={levelKey} className="jira-rice-farm-settings-level-block">
                                        <div
                                            className={`jira-rice-farm-settings-form-group ${errors[`impactCategories.${index}.names.${levelKey}`] ? 'jira-rice-farm-settings-error' : ''}`}>
                                            <label htmlFor={`category-name-level-${index}-${levelKey}`}>
                                                {levelKey} - Имя
                                            </label>
                                            <input
                                                id={`category-name-level-${index}-${levelKey}`}
                                                type="text"
                                                value={category.names[levelKey]}
                                                onChange={(e) => handleCategoryChange(index, `names.${levelKey}`, e.target.value)}
                                            />
                                            {errors[`impactCategories.${index}.names.${levelKey}`] && (
                                                <span
                                                    className="jira-rice-farm-settings-error-message">{errors[`impactCategories.${index}.names.${levelKey}`]}</span>
                                            )}
                                        </div>

                                        <div
                                            className={`jira-rice-farm-settings-form-group ${errors[`impactCategories.${index}.descriptions.${levelKey}`] ? 'jira-rice-farm-settings-error' : ''}`}>
                                            <label htmlFor={`category-description-level-${index}-${levelKey}`}>
                                                {levelKey} - Описание
                                            </label>
                                            <input
                                                id={`category-description-level-${index}-${levelKey}`}
                                                type="text"
                                                value={category.descriptions[levelKey]}
                                                onChange={(e) => handleCategoryChange(index, `descriptions.${levelKey}`, e.target.value)}
                                            />
                                            {errors[`impactCategories.${index}.descriptions.${levelKey}`] && (
                                                <span
                                                    className="jira-rice-farm-settings-error-message">{errors[`impactCategories.${index}.descriptions.${levelKey}`]}</span>
                                            )}
                                        </div>

                                        <div
                                            className={`jira-rice-farm-settings-form-group ${errors[`impactCategories.${index}.values.${levelKey}`] ? 'jira-rice-farm-settings-error' : ''}`}>
                                            <label htmlFor={`category-value-level-${index}-${levelKey}`}>
                                                {levelKey} - Значение
                                            </label>
                                            <input
                                                id={`category-value-level-${index}-${levelKey}`}
                                                type="number"
                                                value={category.values[levelKey]}
                                                onChange={(e) => handleCategoryChange(index, `values.${levelKey}`, e.target.value)}
                                                min="0"
                                                max="100"
                                            />
                                            {errors[`impactCategories.${index}.values.${levelKey}`] && (
                                                <span
                                                    className="jira-rice-farm-settings-error-message">{errors[`impactCategories.${index}.values.${levelKey}`]}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {formData.impactCategories.length > 1 && (
                                    <button type="button" onClick={() => removeCategory(index)}>Удалить
                                        категорию</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addCategory}>Добавить категорию</button>
                    </div>

                    {/* Массив confidences */}
                    <div className="jira-rice-farm-settings-form-group">
                        <h2>Уверенности (Confidences)</h2>
                        {formData.confidences?.map((confidence, index) => (
                            <div key={index} className="jira-rice-farm-settings-confidence-block">
                                <div
                                    className={`jira-rice-farm-settings-form-group ${errors[`confidences.${index}.name`] ? 'jira-rice-farm-settings-error' : ''}`}>
                                    <label htmlFor={`confidence-name-${index}`}>Имя уверенности</label>
                                    <input
                                        id={`confidence-name-${index}`}
                                        type="text"
                                        value={confidence.name}
                                        onChange={(e) => handleConfidenceChange(index, 'name', e.target.value)}
                                    />
                                    {errors[`confidences.${index}.name`] && (
                                        <span
                                            className="jira-rice-farm-settings-error-message">{errors[`confidences.${index}.name`]}</span>
                                    )}
                                </div>

                                <div
                                    className={`jira-rice-farm-settings-form-group ${errors[`confidences.${index}.value`] ? 'jira-rice-farm-settings-error' : ''}`}>
                                    <label htmlFor={`confidence-value-${index}`}>Значение уверенности</label>
                                    <input
                                        id={`confidence-value-${index}`}
                                        type="number"
                                        value={confidence.value}
                                        onChange={(e) => handleConfidenceChange(index, 'value', e.target.value)}
                                        min="0"
                                        max="100"
                                    />
                                    {errors[`confidences.${index}.value`] && (
                                        <span
                                            className="jira-rice-farm-settings-error-message">{errors[`confidences.${index}.value`]}</span>
                                    )}
                                </div>

                                {formData.confidences.length > 1 && (
                                    <button type="button" onClick={() => removeConfidence(index)}>Удалить
                                        уверенность</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addConfidence}>Добавить уверенность</button>
                    </div>

                    {/* Описание для поля effort */}
                    <div
                        className={`jira-rice-farm-settings-form-group ${errors.effortDescription ? 'jira-rice-farm-settings-error' : ''}`}>
                        <label htmlFor="effortDescription">Описание для поля effort</label>
                        <input
                            type="text"
                            id="effortDescription"
                            value={formData.effortDescription}
                            onChange={handleEffortDescriptionChange}
                        />
                        {errors.effortDescription && (
                            <span className="jira-rice-farm-settings-error-message">{errors.effortDescription}</span>
                        )}
                    </div>

                    {/* Кнопки */}
                    <div className="jira-rice-farm-settings-form-buttons">
                        <button
                            type="button"
                            onClick={(e) => handleClose(e, true)}
                            disabled={isSaveButtonDisabled}
                        >
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button type="button" onClick={(e) => handleClose(e)}>
                            Закрыть без сохранения
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    </a>;
};