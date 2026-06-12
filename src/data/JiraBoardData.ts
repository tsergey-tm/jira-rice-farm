import {makeAutoObservable} from 'mobx';
import type {JRFBoardData} from "@/types/JiraRiceFarmTypes.ts";

class JiraBoardDataStore {
    jrfBoardData: JRFBoardData | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setSharedData(data: JRFBoardData) {
        this.jrfBoardData = {...data};
    }
}

export const jiraBoardDataStore = new JiraBoardDataStore();