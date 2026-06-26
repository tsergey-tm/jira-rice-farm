import {getBoardIdFromUrl, getCurrentRoute, Routes} from '@/utils/JiraUtils.ts';

describe('Routing', () => {
    describe('getCurrentRoute', () => {
        it('should identify BOARD route for RapidBoard.jspa', () => {
            const url = 'https://example.com/RapidBoard.jspa';
            expect(getCurrentRoute(url)).toBe(Routes.BOARD);
        });

        it('should identify SETTINGS route for RapidView.jspa', () => {
            const url = 'https://example.com/RapidView.jspa';
            expect(getCurrentRoute(url)).toBe(Routes.SETTINGS);
        });

        it('should identify ISSUE route for browse path', () => {
            const url = 'https://example.com/browse/ISSUE-123';
            expect(getCurrentRoute(url)).toBe(Routes.ISSUE);
        });

        it('should identify NONE route for other URLs', () => {
            const url = 'https://example.com/some-other-path';
            expect(getCurrentRoute(url)).toBe(Routes.NONE);
        });

        it('should identify NONE route for browse with jql parameter', () => {
            const url = 'https://example.com/browse/ISSUE-123?jql=project%3DTEST';
            expect(getCurrentRoute(url)).toBe(Routes.SEARCH);
        });
    });
});

describe('getBoardIdFromUrl', () => {
    it('should extract rapidView from URL', () => {
        const url = 'https://example.com/RapidBoard.jspa?rapidView=123';
        expect(getBoardIdFromUrl(url)).toBe('123');
    });

    it('should extract rapidView from RapidView.jspa URL', () => {
        const url = 'https://example.com/RapidView.jspa?rapidView=456';
        expect(getBoardIdFromUrl(url)).toBe('456');
    });

    it('should return null for invalid URL', () => {
        expect(getBoardIdFromUrl('invalid-url')).toBeNull();
    });

    it('should return null if no ID is found', () => {
        const url = 'https://example.com/something-else';
        expect(getBoardIdFromUrl(url)).toBeNull();
    });
});