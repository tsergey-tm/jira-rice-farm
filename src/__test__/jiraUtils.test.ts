import {getCurrentRoute, Routes} from '@/utils/JiraUtils.ts';

describe('Routing', () => {
    describe('getCurrentRoute', () => {
        it('should identify BOARD route for RapidBoard.jspa', () => {
            const url = 'https://example.com/RapidBoard.jspa';
            expect(getCurrentRoute(url)).toBe(Routes.BOARD);
        });

        it('should identify BOARD route for boards path', () => {
            const url = 'https://example.com/boards/123';
            expect(getCurrentRoute(url)).toBe(Routes.BOARD);
        });

        it('should identify SETTINGS route for RapidView.jspa', () => {
            const url = 'https://example.com/RapidView.jspa';
            expect(getCurrentRoute(url)).toBe(Routes.SETTINGS);
        });

        it('should identify SETTINGS route for board with config parameter', () => {
            const url = 'https://example.com/boards/123?config=true';
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