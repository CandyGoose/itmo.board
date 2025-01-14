import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
    Board,
    createBoard,
    deleteBoard,
    getAllBoards,
    renameBoard,
    getBoardById,
} from './Board';

describe('boardService', () => {
    let mock: MockAdapter;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    describe('getAllBoards', () => {
        it('should return a list of boards', async () => {
            const mockBoards: Board[] = [
                {
                    _id: '1',
                    title: 'Board 1',
                    orgId: 'org1',
                    authorId: 'user1',
                    imageUrl: '/img1.svg',
                },
                {
                    _id: '2',
                    title: 'Board 2',
                    orgId: 'org1',
                    authorId: 'user1',
                    imageUrl: '/img2.svg',
                },
            ];
            mock.onGet(
                `${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`,
            ).reply(200, mockBoards);

            const boards = await getAllBoards('user1', 'org1');

            expect(boards).toEqual(mockBoards);
        });

        it('should return undefined if no data is found', async () => {
            mock.onGet(
                `${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`,
            ).reply(200, null);

            const boards = await getAllBoards('user1', 'org1');

            expect(boards).toBeUndefined();
        });

        it('should throw error if request fails', async () => {
            mock.onGet(
                `${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`,
            ).reply(500);

            try {
                await getAllBoards('user1', 'org1');
            } catch (error) {
                const axiosError = error as AxiosError;
                expect(axiosError.response?.status).toBe(500);
            }
        });
    });

    describe('createBoard', () => {
        it('should create a new board and return a response', async () => {
            const mockBoards: Board[] = [
                {
                    _id: '1',
                    title: 'Board 1',
                    orgId: 'org1',
                    authorId: 'user1',
                    imageUrl: '/img1.svg',
                },
            ];
            const mockResponse = {
                _id: '2',
                title: 'Untitle-1',
                orgId: 'org1',
                authorId: 'user1',
                imageUrl: '/placeholders/1.svg',
            };
            mock.onGet(
                `${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`,
            ).reply(200, mockBoards);
            mock.onPost(`${process.env.NEXT_PUBLIC_API_URL}/boards`).reply(
                200,
                mockResponse,
            );

            const response = await createBoard('user1', 'org1');

            expect(response.data).toEqual(mockResponse);
            expect(response.data.title).toBe('Untitle-1');
        });

        it('should handle errors when creating a board', async () => {
            const mockBoards: Board[] = [
                {
                    _id: '1',
                    title: 'Board 1',
                    orgId: 'org1',
                    authorId: 'user1',
                    imageUrl: '/img1.svg',
                },
            ];
            mock.onGet(
                `${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`,
            ).reply(200, mockBoards);
            mock.onPost(`${process.env.NEXT_PUBLIC_API_URL}/boards`).reply(500);

            try {
                await createBoard('user1', 'org1');
            } catch (error) {
                const axiosError = error as AxiosError;
                expect(axiosError.response?.status).toBe(500);
            }
        });
    });

    describe('renameBoard', () => {
        it('should rename the board and return the updated response', async () => {
            const mockResponse = {
                message: 'Board title updated successfully',
            };

            mock.onPut(
                `${process.env.NEXT_PUBLIC_API_URL}/boards/title/1`,
            ).reply(200, mockResponse);

            const response = await renameBoard('1', 'New Title');

            expect(response.data).toEqual(mockResponse);
            expect(response.data.message).toBe(
                'Board title updated successfully',
            );
        });

        it('should handle error when renaming the board', async () => {
            mock.onPut(
                `${process.env.NEXT_PUBLIC_API_URL}/boards/title/1`,
            ).reply(500);

            try {
                await renameBoard('1', 'New Title');
            } catch (error) {
                const axiosError = error as AxiosError;
                expect(axiosError.response?.status).toBe(500);
            }
        });
    });

    describe('deleteBoard', () => {
        it('should delete the board and return success message', async () => {
            const mockResponse = { message: 'Board deleted successfully' };

            mock.onDelete(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`).reply(
                200,
                mockResponse,
            );

            const response = await deleteBoard('1');

            expect(response.data).toEqual(mockResponse);
            expect(response.data.message).toBe('Board deleted successfully');
        });

        it('should handle error when deleting the board', async () => {
            mock.onDelete(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`).reply(
                500,
            );

            try {
                await deleteBoard('1');
            } catch (error) {
                const axiosError = error as AxiosError;
                expect(axiosError.response?.status).toBe(500);
            }
        });
    });

    describe('getBoardById', () => {
        it('should return the board data when the board exists', async () => {
            const mockBoard: Board = {
                _id: '1',
                title: 'Board 1',
                orgId: 'org1',
                authorId: 'user1',
                imageUrl: '/img1.svg',
            };

            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`).reply(
                200,
                mockBoard,
            );

            const board = await getBoardById('1');

            expect(board).toEqual(mockBoard);
        });

        it('should return undefined if the board does not exist', async () => {
            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`).reply(
                404,
            );

            const board = await getBoardById('1');

            expect(board).toBeUndefined();
        });

        it('should handle errors gracefully', async () => {
            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/1`).reply(
                500,
            );

            const board = await getBoardById('1');

            expect(board).toBeUndefined();
        });
    });
});
