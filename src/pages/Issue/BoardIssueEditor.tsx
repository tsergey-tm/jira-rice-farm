import {type ChangeEvent, type FC, useEffect, useMemo, useState} from "react";
import Modal from "react-modal";
import {jiraBoardDataStore} from "@/data/JiraData.ts";
import {getBoardId, getIssueData, setIssueData} from "@/utils/JiraUtils.ts";
import {JRFBoardDataImpactCategoryLevelKeys, type JRFIssueData} from "@/types/JiraRiceFarmTypes.ts";
import "./BoardIssueEditor.css";
import {observer} from "mobx-react-lite";

Modal.setAppElement('#jira')

interface BoardIssueEditorProps {
    issueKey: string;
    isOpen: boolean;
    onClose: () => void;
}

const createDefaultIssueData = (): JRFIssueData => ({
    reach: {
        type: "sample",
        income: 0,
        size: 0
    },
    impacts: {},
    confidence: "",
    effort: 1
});

export const BoardIssueEditor: FC<BoardIssueEditorProps> = observer(({issueKey, isOpen, onClose}) => {
    const [formData, setFormData] = useState<JRFIssueData>(createDefaultIssueData());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const boardId = getBoardId();
    const boardData = jiraBoardDataStore.jrfBoardData;

    const ensureImpactValues = (data: JRFIssueData): JRFIssueData => {
        const impactCategories = jiraBoardDataStore.jrfBoardData?.impactCategories ?? [];
        const defaultImpacts = impactCategories.reduce<JRFIssueData["impacts"]>((acc, category) => {
            acc[category.name] = JRFBoardDataImpactCategoryLevelKeys.None;
            return acc;
        }, {});

        return {
            ...data,
            impacts: {
                ...defaultImpacts,
                ...data.impacts
            }
        };
    };

    // Загрузка данных задачи при открытии формы
    useEffect(() => {
        if (!isOpen || !issueKey) return;

        const loadIssueData = async () => {
            setIsLoading(true);
            try {
                if (!boardId) {
                    throw new Error("Не удалось получить boardId");
                }

                const data = await getIssueData(issueKey, boardId);
                setFormData(ensureImpactValues(data ?? createDefaultIssueData()));
            } catch (error) {
                console.error("Ошибка загрузки данных задачи:", error);
                // При ошибке используем значения по умолчанию
                setFormData(ensureImpactValues(createDefaultIssueData()));
            } finally {
                setIsLoading(false);
            }
        };

        void loadIssueData();
    }, [isOpen, issueKey, boardId]);

    const errors = useMemo<Record<string, string>>(() => {
        const newErrors: Record<string, string> = {};

        // Проверка Reach
        if (formData.reach.type === 'sample') {
            if (formData.reach.size < 0 || formData.reach.size > 100000000) {
                newErrors['reach.size'] = "Размер выборки должен быть от 0 до 100,000,000";
            }
            if (formData.reach.income < 0 || formData.reach.income > 1000000000) {
                newErrors['reach.income'] = "Средний доход выборки должен быть от 0 до 1,000,000,000";
            }
        } else {
            if (formData.reach.income < 0 || formData.reach.income > 1000000000) {
                newErrors['reach.income'] = "Предполагаемое увеличение прибыли должно быть от 0 до 1,000,000,000";
            }
        }

        // Проверка Impact
        if (boardData?.impactCategories) {
            boardData.impactCategories.forEach(category => {
                const value = formData.impacts[category.name];
                if (!value) {
                    newErrors[`impacts.${category.name}`] = "Выберите значение для категории";
                }
            });
        }

        // Проверка Confidence
        if (!formData.confidence.trim()) {
            newErrors['confidence'] = "Выберите уровень уверенности";
        }

        // Проверка Effort
        if (formData.effort < 1 || formData.effort > 100) {
            newErrors['effort'] = "Сложность должна быть от 1 до 100";
        }

        return newErrors;
    }, [formData, boardData]);

    const confidenceOptions = boardData?.confidences.map(conf => conf.name) ?? [];
    const impactCategories = boardData?.impactCategories ?? [];

    const isSaveButtonDisabled = Object.keys(errors).length > 0 || isSaving || isLoading;

    const handleSave = async () => {
        if (isSaveButtonDisabled) return;

        setIsSaving(true);
        try {
            if (!boardId) {
                throw new Error("Не удалось получить boardId");
            }

            await setIssueData(issueKey, formData, boardId);
            onClose();
        } catch (error) {
            console.error("Ошибка сохранения данных задачи:", error);
            // В реальном приложении здесь можно показать алерт пользователю
        } finally {
            setIsSaving(false);
        }
    };

    const handleOnlyMoneyChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isOnlyMoney = e.target.checked;
        setFormData({
            ...formData,
            reach: {
                type: isOnlyMoney ? 'money' : 'sample',
                income: formData.reach.income,
                size: isOnlyMoney ? 0 : formData.reach.size
            }
        });
    };

    const handleReachSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setFormData({
            ...formData,
            reach: {
                ...formData.reach,
                size: isNaN(value) ? 0 : value
            }
        });
    };

    const handleReachIncomeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setFormData({
            ...formData,
            reach: {
                ...formData.reach,
                income: isNaN(value) ? 0 : value
            }
        });
    };

    const handleImpactChange = (categoryName: string, value: JRFBoardDataImpactCategoryLevelKeys) => {
        setFormData({
            ...formData,
            impacts: {
                ...formData.impacts,
                [categoryName]: value
            }
        });
    };

    const handleConfidenceChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData({
            ...formData,
            confidence: e.target.value
        });
    };

    const handleEffortChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setFormData({
            ...formData,
            effort: isNaN(value) ? 1 : value
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
            className={"jira-rice-farm-issue-editor-modal"}
            overlayClassName={"jira-rice-farm-issue-editor-overlay"}
        >
            <div className="jira-rice-farm-issue-editor-form">
                <h1>Редактирование задачи</h1>

                {isLoading ? (
                    <p>Загрузка данных...</p>
                ) : (
                    <>
                        {/* Reach */}
                        <div className="jira-rice-farm-issue-editor-form-group">
                            <label>Reach (Охват)</label>

                            <div className="jira-rice-farm-issue-editor-reach-type">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.reach.type === 'money'}
                                        onChange={handleOnlyMoneyChange}
                                    />
                                    Только деньги
                                </label>
                                <div
                                    className={`jira-rice-farm-issue-editor-form-group ${errors['reach.income'] ? 'jira-rice-farm-issue-editor-error' : ''}`}>
                                    <label htmlFor="reachIncome">Средний доход выборки/прибыль</label>
                                    <input
                                        id="reachIncome"
                                        type="number"
                                        value={formData.reach.income}
                                        onChange={handleReachIncomeChange}
                                        min="0"
                                        max="1000000000"
                                    />
                                    {errors['reach.income'] && (
                                        <span
                                            className="jira-rice-farm-issue-editor-error-message">{errors['reach.income']}</span>
                                    )}
                                </div>

                                {formData.reach.type === 'sample' && (
                                    <div
                                        className={`jira-rice-farm-issue-editor-form-group ${errors['reach.size'] ? 'jira-rice-farm-issue-editor-error' : ''}`}>
                                        <label htmlFor="reachSize">Размер выборки</label>
                                        <input
                                            id="reachSize"
                                            type="number"
                                            value={formData.reach.size}
                                            onChange={handleReachSizeChange}
                                            min="0"
                                            max="100000000"
                                        />
                                        {errors['reach.size'] && (
                                            <span
                                                className="jira-rice-farm-issue-editor-error-message">{errors['reach.size']}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Impacts */}
                        <div className="jira-rice-farm-issue-editor-form-group">
                            <h2>Impacts (Влияние)</h2>
                            {impactCategories.map((category) => (
                                <div key={category.name} className="jira-rice-farm-issue-editor-impact-category">
                                    <label htmlFor={`impact-${category.name}`}>
                                        {category.name}
                                    </label>
                                    <div className="jira-rice-farm-issue-editor-impact-description">
                                        {category.description}
                                    </div>
                                    <select
                                        id={`impact-${category.name}`}
                                        className={`impact-${(formData.impacts[category.name] || JRFBoardDataImpactCategoryLevelKeys.None).toLowerCase()}`}
                                        value={formData.impacts[category.name] || JRFBoardDataImpactCategoryLevelKeys.None}
                                        onChange={(e) => handleImpactChange(category.name, e.target.value as JRFBoardDataImpactCategoryLevelKeys)}
                                    >
                                        {Object.entries(category.names).map(([key, name]) => (
                                            <option key={key} value={key}
                                                    className={`option-${key.toLowerCase()}`}>{name}</option>
                                        ))}
                                    </select>

                                    {errors[`impacts.${category.name}`] && (
                                        <span
                                            className="jira-rice-farm-issue-editor-error-message">{errors[`impacts.${category.name}`]}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Confidence */}
                        <div
                            className={`jira-rice-farm-issue-editor-form-group ${errors['confidence'] ? 'jira-rice-farm-issue-editor-error' : ''}`}>
                            <label htmlFor="confidence">Confidence (Уверенность)</label>
                            <select
                                id="confidence"
                                value={formData.confidence}
                                onChange={handleConfidenceChange}
                            >
                                <option value="">Выберите уровень уверенности</option>
                                {confidenceOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {errors['confidence'] && (
                                <span
                                    className="jira-rice-farm-issue-editor-error-message">{errors['confidence']}</span>
                            )}
                        </div>

                        {/* Effort */}
                        <div
                            className={`jira-rice-farm-issue-editor-form-group ${errors['effort'] ? 'jira-rice-farm-issue-editor-error' : ''}`}>
                            <label htmlFor="effort">
                                {boardData?.effortDescription || "Сложность"}
                            </label>
                            <input
                                id="effort"
                                type="number"
                                value={formData.effort}
                                onChange={handleEffortChange}
                                min="1"
                                max="100"
                            />
                            {errors['effort'] && (
                                <span className="jira-rice-farm-issue-editor-error-message">{errors['effort']}</span>
                            )}
                        </div>

                        {/* Кнопки */}
                        <div className="jira-rice-farm-issue-editor-form-buttons">
                            <button
                                type="button"
                                onClick={() => {
                                    void handleSave();
                                }}
                                disabled={isSaveButtonDisabled}
                            >
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button type="button" onClick={onClose}>
                                Закрыть без сохранения
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
});