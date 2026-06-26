export const Routes = {
    BOARD: 'BOARD',
    ISSUES_LIST: 'ISSUES_LIST',
    SETTINGS: 'SETTINGS',
    SEARCH: 'SEARCH',
    REPORTS: 'REPORTS',
    ISSUE: 'ISSUE',
    NONE: 'NONE',
};

const usedRoutes: Set<string> = new Set<string>([
    Routes.BOARD,
    Routes.ISSUES_LIST,
    Routes.SETTINGS,
]);

export const isJira = () => {
    return document.body.id === 'jira' && usedRoutes.has(getCurrentRoute());
}

export const getCurrentRoute = (url: string | undefined = undefined) => {
    const _url: URL | Location = url ? new URL(url) : window.location;
    const {pathname, search} = _url;
    const params = new URLSearchParams(search);

    if (pathname.includes('RapidView.jspa')) return Routes.SETTINGS;

    if (pathname.includes('RapidBoard.jspa')) {
        if (params.get('config')) return Routes.SETTINGS;
        if (params.get('view') === 'reporting') return Routes.REPORTS;
        if (params.get('view')?.startsWith('planning')) return Routes.ISSUES_LIST;

        return Routes.BOARD;
    }
    if (pathname.startsWith('/browse')) {
        return params.get('jql') ? Routes.SEARCH : Routes.ISSUE;
    }

    return Routes.NONE;
};

export const getBoardIdFromUrl = (urlStr?: string): string | null => {
    let url: URL;
    try {
        if (urlStr) {
            url = new URL(urlStr);
        } else {
            url = new URL(window.location.href);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        return null;
    }

    const {pathname, search} = url;
    const params = new URLSearchParams(search);

    if (pathname.includes('RapidView.jspa') || pathname.includes('RapidBoard.jspa')) {
        return params.get('rapidView');
    }
    return null;
};
