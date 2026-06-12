import type {ModifyProcessor} from "./types.ts";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {Settings} from "@/pages/Settings/Settings.tsx";

export const modifySettings: ModifyProcessor = (): boolean => {

    const menuContainer = document.getElementById('ghx-config-nav');
    const menuInjectionId = 'jira-rice-farm-menuInjection';

    let modified = false;
    if (menuContainer) {
        let menuInjection = document.getElementById(menuInjectionId);
        if (!menuInjection) {
            modified = true;
            menuInjection = document.createElement('li')
            menuInjection.id = menuInjectionId;
            menuInjection.innerText = "Jira RICE farm";

            menuContainer.appendChild(menuInjection);

            createRoot(menuInjection).render(
                <StrictMode>
                    <Settings/>
                </StrictMode>
            );
        }
    }

    return modified;
};