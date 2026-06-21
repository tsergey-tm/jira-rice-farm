import {observer} from "mobx-react-lite";
import {jiraBoardDataStore} from "@/data/JiraData.ts";

export const BoardInjectedIcon = observer(() => {

    const hasData = !!jiraBoardDataStore.jrfBoardData.value;

    const iconUrl: string = chrome.runtime.getURL('icon32' + (hasData ? '' : 'bw') + '.png');

    return <img src={iconUrl} alt={"Jira RICE farm"} className={"jira-rice-farm-icon-img"} width={32}
                height={32}/>;
});
