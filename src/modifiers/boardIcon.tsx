import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import type {ModifyProcessor} from "./types.ts";
import {BoardInjectedIcon} from "@/pages/Board/BoardInjectedIcon.tsx";


const iconInjectionId = 'jira-rice-farm-icon';

const findContainer = (): Element | null => {
    const elementsByClassName = document.getElementsByClassName('aui-sidebar-body');
    if (elementsByClassName.length > 1) {
        console.warn("[Jira RICE farm] Too many containers found");
        return null;
    } else if (elementsByClassName.length === 1) {
        return elementsByClassName.item(0);
    } else {
        return null;
    }
}

const processBoardIcon = () => {
    const container = findContainer();
    const icon = document.getElementById(iconInjectionId)

    let isChanged = false;

    if (!!container && !icon) {

        const div = document.createElement('div');
        div.id = iconInjectionId;
        div.className = 'jira-rice-farm-icon';

        container.append(div);
        createRoot(div).render(
            <StrictMode>
                <BoardInjectedIcon/>
            </StrictMode>
        );
        isChanged = true;
    }
    return isChanged;
};

export const modifyBoardIcon: ModifyProcessor = (): boolean => {
    return processBoardIcon();
};