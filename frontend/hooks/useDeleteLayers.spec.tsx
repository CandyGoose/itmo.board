import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDeleteLayers } from './useDeleteLayers';
import { useSelf, useMutation } from '@/liveblocks.config';

interface Presence {
    selection: string[];
}

interface Storage {
    get: (key: string) => unknown;
}

interface MutationContext {
    storage: Storage;
    setMyPresence: (presence: Partial<Presence>, options?: { addToHistory: boolean }) => void;
}

jest.mock('@/liveblocks.config', () => ({
    useSelf: jest.fn(),
    useMutation: jest.fn(),
}));

describe('useDeleteLayers', () => {
    const mockDelete = jest.fn();
    const mockIndexOf = jest.fn();
    const mockDeleteLayerId = jest.fn();
    const mockGet = jest.fn();
    const mockSetMyPresence = jest.fn();

    const mockLiveLayers = {
        delete: mockDelete,
    };

    const mockLiveLayerIds = {
        indexOf: mockIndexOf,
        delete: mockDeleteLayerId,
    };

    const mockStorage: Storage = {
        get: mockGet,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useSelf as jest.Mock).mockImplementation((selector: (me: { presence: Presence }) => unknown) =>
            selector({ presence: { selection: [] } })
        );

        (useMutation as jest.Mock).mockImplementation(
            (
                mutationFn: (context: MutationContext) => void,
            ) => {
                return () => mutationFn({ storage: mockStorage, setMyPresence: mockSetMyPresence });
            }
        );

        // Default storage mock
        mockGet.mockImplementation((key: string) => {
            if (key === 'layers') return mockLiveLayers;
            if (key === 'layerIds') return mockLiveLayerIds;
            return null;
        });
    });

    const TestComponent = () => {
        const deleteLayers = useDeleteLayers();
        return <button onClick={() => deleteLayers()}>Delete Layers</button>;
    };

    const setupSelection = (selection: string[], indexOfMap: Record<string, number>) => {
        (useSelf as jest.Mock).mockImplementation(
            (selector: (me: { presence: Presence }) => unknown) => selector({ presence: { selection } })
        );

        mockIndexOf.mockImplementation((id: string) => {
            return indexOfMap.hasOwnProperty(id) ? indexOfMap[id] : -1;
        });
    };

    it('deletes selected layers and clears selection', () => {
        const selection = ['layer1', 'layer2'];
        const indexOfMap = {
            layer1: 0,
            layer2: 1,
        };

        setupSelection(selection, indexOfMap);

        const { getByText } = render(<TestComponent />);

        fireEvent.click(getByText('Delete Layers'));

        expect(mockDelete).toHaveBeenCalledTimes(2);
        expect(mockDelete).toHaveBeenCalledWith('layer1');
        expect(mockDelete).toHaveBeenCalledWith('layer2');

        expect(mockIndexOf).toHaveBeenCalledTimes(2);
        expect(mockIndexOf).toHaveBeenCalledWith('layer1');
        expect(mockIndexOf).toHaveBeenCalledWith('layer2');

        expect(mockDeleteLayerId).toHaveBeenCalledTimes(2);
        expect(mockDeleteLayerId).toHaveBeenCalledWith(0);
        expect(mockDeleteLayerId).toHaveBeenCalledWith(1);

        expect(mockSetMyPresence).toHaveBeenCalledTimes(1);
        expect(mockSetMyPresence).toHaveBeenCalledWith({ selection: [] }, { addToHistory: true });
    });

    it('handles layerIds.indexOf returning -1', () => {
        const selection = ['layer1', 'layer2'];
        const indexOfMap = {
            layer1: -1, // layer1 does not exist in layerIds
            layer2: 1,  // layer2 exists at index 1
        };

        setupSelection(selection, indexOfMap);

        const { getByText } = render(<TestComponent />);

        fireEvent.click(getByText('Delete Layers'));

        expect(mockDelete).toHaveBeenCalledTimes(2);
        expect(mockDelete).toHaveBeenCalledWith('layer1');
        expect(mockDelete).toHaveBeenCalledWith('layer2');

        expect(mockIndexOf).toHaveBeenCalledTimes(2);
        expect(mockIndexOf).toHaveBeenCalledWith('layer1');
        expect(mockIndexOf).toHaveBeenCalledWith('layer2');

        expect(mockDeleteLayerId).toHaveBeenCalledTimes(1);
        expect(mockDeleteLayerId).toHaveBeenCalledWith(1);

        expect(mockSetMyPresence).toHaveBeenCalledTimes(1);
        expect(mockSetMyPresence).toHaveBeenCalledWith({ selection: [] }, { addToHistory: true });
    });

    it('does nothing if selection is empty', () => {
        const selection: string[] = [];
        const indexOfMap: Record<string, number> = {};

        setupSelection(selection, indexOfMap);

        const { getByText } = render(<TestComponent />);

        fireEvent.click(getByText('Delete Layers'));

        expect(mockDelete).not.toHaveBeenCalled();

        expect(mockIndexOf).not.toHaveBeenCalled();

        expect(mockDeleteLayerId).not.toHaveBeenCalled();

        expect(mockSetMyPresence).toHaveBeenCalledTimes(1);
        expect(mockSetMyPresence).toHaveBeenCalledWith({ selection: [] }, { addToHistory: true });
    });
});
