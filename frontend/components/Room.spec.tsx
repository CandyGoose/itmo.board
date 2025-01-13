import { render } from '@testing-library/react';
import { Room } from './Room';
import { RoomProvider } from '@/liveblocks.config';
import { LiveblocksProvider } from '@liveblocks/react/suspense';

jest.mock('@liveblocks/react/suspense', () => ({
    LiveblocksProvider: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock('@/liveblocks.config', () => ({
    RoomProvider: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock('@liveblocks/react', () => ({
    ClientSideSuspense: jest.fn(({ fallback, children }) => (
        <div>{children ? children() : fallback}</div>
    )),
}));

describe('Room Component', () => {
    const mockRoomId = 'test-room-id';
    const mockFallback = <div>Loading...</div>;
    const mockChildren = <div>Room Content</div>;

    it('renders LiveblocksProvider with correct authEndpoint', () => {
        render(
            <Room roomId={mockRoomId} fallback={mockFallback}>
                {mockChildren}
            </Room>,
        );

        expect(LiveblocksProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                authEndpoint: '/api/liveblocks-auth',
                throttle: 16,
            }),
            expect.anything(),
        );
    });

    it('renders RoomProvider with correct id and initialPresence/initialStorage', () => {
        render(
            <Room roomId={mockRoomId} fallback={mockFallback}>
                {mockChildren}
            </Room>,
        );

        expect(RoomProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                id: mockRoomId,
                initialPresence: {
                    cursor: null,
                    selection: [],
                    pencilDraft: null,
                    penColor: null,
                },
                initialStorage: {
                    layers: expect.any(Object),
                    layerIds: expect.any(Object),
                },
            }),
            expect.anything(),
        );
    });
});
