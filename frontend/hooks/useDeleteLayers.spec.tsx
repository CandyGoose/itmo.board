import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDeleteLayers } from './useDeleteLayers';
import { useSelf, useMutation } from '@/liveblocks.config';

jest.mock('@/liveblocks.config', () => ({
    useSelf: jest.fn(),
    useMutation: jest.fn(),
}));

describe('useDeleteLayers', () => {
    const mockLiveLayers = {
        delete: jest.fn(),
    };

    const mockLiveLayerIds = {
        indexOf: jest.fn(),
        delete: jest.fn(),
    };

    const mockStorage = {
        get: jest.fn((key: string) => {
            if (key === 'layers') return mockLiveLayers;
            if (key === 'layerIds') return mockLiveLayerIds;
            return null;
        }),
    };

    const mockSetMyPresence = jest.fn();

    const TestComponent = () => {
        const deleteLayers = useDeleteLayers();
        return <button onClick={() => deleteLayers()}>Delete Layers</button>;
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('deletes selected layers and clears selection', () => {
        const selection = ['layer1', 'layer2'];

        (useSelf as jest.Mock).mockImplementation((selector: Function) => selector({ presence: { selection } }));

        (useMutation as jest.Mock).mockImplementation((mutationFn) => {
            return () => mutationFn({ storage: mockStorage, setMyPresence: mockSetMyPresence });
        });

        mockLiveLayerIds.indexOf.mockImplementation((id: string) => {
            if (id === 'layer1') return 0;
            if (id === 'layer2') return 1;
            return -1;
        });

        const { getByText } = render(<TestComponent />);

        fireEvent.click(getByText('Delete Layers'));

        expect(mockLiveLayers.delete).toHaveBeenCalledTimes(2);
        expect(mockLiveLayers.delete).toHaveBeenCalledWith('layer1');
        expect(mockLiveLayers.delete).toHaveBeenCalledWith('layer2');

        expect(mockLiveLayerIds.indexOf).toHaveBeenCalledTimes(2);
        expect(mockLiveLayerIds.indexOf).toHaveBeenCalledWith('layer1');
        expect(mockLiveLayerIds.indexOf).toHaveBeenCalledWith('layer2');

        expect(mockLiveLayerIds.delete).toHaveBeenCalledTimes(2);
        expect(mockLiveLayerIds.delete).toHaveBeenCalledWith(0);
        expect(mockLiveLayerIds.delete).toHaveBeenCalledWith(1);

        expect(mockSetMyPresence).toHaveBeenCalledTimes(1);
        expect(mockSetMyPresence).toHaveBeenCalledWith({ selection: [] }, { addToHistory: true });
    });

    it('handles layerIds.indexOf returning -1', () => {
        const selection = ['layer1', 'layer2'];

        (useSelf as jest.Mock).mockImplementation((selector: Function) => selector({ presence: { selection } }));

        (useMutation as jest.Mock).mockImplementation((mutationFn) => {
            return () => mutationFn({ storage: mockStorage, setMyPresence: mockSetMyPresence });
        });

        // Mock liveLayerIds.indexOf to return -1 for 'layer1' and valid index for 'layer2'
        mockLiveLayerIds.indexOf.mockImplementation((id: string) => {
            if (id === 'layer1') return -1;
            if (id === 'layer2') return 1;
            return -1;
        });

        const { getByText } = render(<TestComponent />);

        fireEvent.click(getByText('Delete Layers'));

        expect(mockLiveLayers.delete).toHaveBeenCalledTimes(2);
        expect(mockLiveLayers.delete).toHaveBeenCalledWith('layer1');
        expect(mockLiveLayers.delete).toHaveBeenCalledWith('layer2');

        expect(mockLiveLayerIds.indexOf).toHaveBeenCalledTimes(2);
        expect(mockLiveLayerIds.indexOf).toHaveBeenCalledWith('layer1');
        expect(mockLiveLayerIds.indexOf).toHaveBeenCalledWith('layer2');

        expect(mockLiveLayerIds.delete).toHaveBeenCalledTimes(1);
        expect(mockLiveLayerIds.delete).toHaveBeenCalledWith(1);

        expect(mockSetMyPresence).toHaveBeenCalledTimes(1);
        expect(mockSetMyPresence).toHaveBeenCalledWith({ selection: [] }, { addToHistory: true });
    });

    it('does nothing if selection is empty', () => {
        const selection: string[] = [];

        (useSelf as jest.Mock).mockImplementation((selector: Function) => selector({ presence: { selection } }));

        (useMutation as jest.Mock).mockImplementation((mutationFn) => {
            return () => mutationFn({ storage: mockStorage, setMyPresence: mockSetMyPresence });
        });

        const { getByText } = render(<TestComponent />);

        fireEvent.click(getByText('Delete Layers'));

        expect(mockLiveLayers.delete).not.toHaveBeenCalled();

        expect(mockLiveLayerIds.indexOf).not.toHaveBeenCalled();

        expect(mockLiveLayerIds.delete).not.toHaveBeenCalled();

        expect(mockSetMyPresence).toHaveBeenCalledTimes(1);
        expect(mockSetMyPresence).toHaveBeenCalledWith({ selection: [] }, { addToHistory: true });
    });
});
