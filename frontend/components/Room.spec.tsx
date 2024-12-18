import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Room } from './Room';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { LiveMap, LiveList } from '@liveblocks/client';

jest.mock('@/liveblocks.config', () => ({
    RoomProvider: jest.fn(({ children }: { children: React.ReactNode }) => (
        <div data-testid="room-provider">{children}</div>
    )),
}));

jest.mock('@liveblocks/react', () => ({
    ClientSideSuspense: jest.fn(),
}));

jest.mock('@liveblocks/client', () => ({
    LiveMap: jest.fn().mockImplementation(() => ({})),
    LiveList: jest.fn().mockImplementation(() => ({})),
    LiveObject: jest.fn().mockImplementation(() => ({})),
}));

describe('Room Component', () => {
    const roomId = 'test-room';
    const fallbackText = 'Loading...';
    const childText = 'Child Component';

    beforeEach(() => {
        (ClientSideSuspense as jest.Mock).mockImplementation(({ children }: any) => (
            <div data-testid="client-side-suspense">{children ? children() : null}</div>
        ));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders children correctly within RoomProvider and ClientSideSuspense', () => {
        render(
            <Room roomId={roomId} fallback={fallbackText}>
                <div>{childText}</div>
            </Room>
        );

        const roomProvider = screen.getByTestId('room-provider');
        expect(roomProvider).toBeInTheDocument();

        const suspense = screen.getByTestId('client-side-suspense');
        expect(suspense).toBeInTheDocument();

        expect(screen.getByText(childText)).toBeInTheDocument();

        expect(RoomProvider).toHaveBeenCalledTimes(1);
        const props = (RoomProvider as jest.Mock).mock.calls[0][0];

        expect(props.id).toBe(roomId);
        expect(props.initialPresence).toEqual({
            cursor: null,
            selection: [],
            pencilDraft: null,
            penColor: null,
        });
        expect(props.initialStorage.layers).toBeDefined();
        expect(props.initialStorage.layerIds).toBeDefined();

        expect(LiveMap).toHaveBeenCalledTimes(1);
        expect(LiveList).toHaveBeenCalledTimes(1);
    });

    it('renders fallback when ClientSideSuspense is in fallback state', () => {
        (ClientSideSuspense as jest.Mock).mockImplementation(({ fallback }: any) => (
            <div data-testid="client-side-suspense-fallback">{fallback}</div>
        ));

        render(
            <Room roomId={roomId} fallback={fallbackText}>
                <div>{childText}</div>
            </Room>
        );

        const fallback = screen.getByTestId('client-side-suspense-fallback');
        expect(fallback).toHaveTextContent(fallbackText);

        expect(screen.queryByText(childText)).not.toBeInTheDocument();
    });

    it('initializes LiveMap and LiveList correctly', () => {
        render(
            <Room roomId={roomId} fallback={fallbackText}>
                <div>{childText}</div>
            </Room>
        );

        expect(LiveMap).toHaveBeenCalledWith();
        expect(LiveList).toHaveBeenCalledWith();
    });
});