import axios, {AxiosError} from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAllBoards, createBoard, Board } from './Board';

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
                { _id: '1', title: 'Board 1', orgId: 'org1', authorId: 'user1', imageUrl: '/img1.svg' },
                { _id: '2', title: 'Board 2', orgId: 'org1', authorId: 'user1', imageUrl: '/img2.svg' },
            ];
            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`).reply(200, mockBoards);

            const boards = await getAllBoards('user1', 'org1');

            expect(boards).toEqual(mockBoards);
        });

        it('should return undefined if no data is found', async () => {
            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`).reply(200, null);

            const boards = await getAllBoards('user1', 'org1');

            expect(boards).toBeUndefined();
        });

        it('should throw error if request fails', async () => {
            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`).reply(500);

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
                { _id: '1', title: 'Board 1', orgId: 'org1', authorId: 'user1', imageUrl: '/img1.svg' }
            ];
            const mockResponse = { _id: '2', title: 'Untitle-1', orgId: 'org1', authorId: 'user1', imageUrl: '/placeholders/1.svg' };
            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`).reply(200, mockBoards);
            mock.onPost(`${process.env.NEXT_PUBLIC_API_URL}/boards`).reply(200, mockResponse);

            const response = await createBoard('user1', 'org1');

            expect(response.data).toEqual(mockResponse);
            expect(response.data.title).toBe('Untitle-1');
        });

        it('should handle errors when creating a board', async () => {
            const mockBoards: Board[] = [
                { _id: '1', title: 'Board 1', orgId: 'org1', authorId: 'user1', imageUrl: '/img1.svg' }
            ];
            mock.onGet(`${process.env.NEXT_PUBLIC_API_URL}/boards/user1/org1`).reply(200, mockBoards);
            mock.onPost(`${process.env.NEXT_PUBLIC_API_URL}/boards`).reply(500);

            try {
                await createBoard('user1', 'org1');
            } catch (error) {
                const axiosError = error as AxiosError;
                expect(axiosError.response?.status).toBe(500);
            }
        });
    });
});