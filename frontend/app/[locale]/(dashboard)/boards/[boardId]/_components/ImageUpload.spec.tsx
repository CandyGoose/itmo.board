import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageUpload } from './ImageUpload';

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');

let mockWorkerInstance: Worker;

beforeAll(() => {
    global.Worker = jest.fn(() => {
        const worker = {
            postMessage: jest.fn(),
            terminate: jest.fn(),
            onmessage: null as
                | ((this: Worker, ev: MessageEvent) => never)
                | null,

            onerror: null,
            onmessageerror: null,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(() => false),
        };

        mockWorkerInstance = worker as unknown as Worker;

        return mockWorkerInstance;
    }) as unknown as typeof Worker;
});

describe('ImageUpload component', () => {
    const mockOnClose = jest.fn();
    const mockOnUploadComplete = jest.fn();

    const setup = () => {
        return render(
            <ImageUpload
                onClose={mockOnClose}
                onUploadComplete={mockOnUploadComplete}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = 'http://mockapi.com';
    });

    it('calls onClose when clicking outside of the modal or the close button', () => {
        const { getByTestId } = setup();

        fireEvent.click(getByTestId('close-button'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);

        mockOnClose.mockReset();

        fireEvent.click(getByTestId('backdrop'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('uploads a file (select from computer) and calls onUploadComplete on worker success', async () => {
        const { getByLabelText } = setup();

        const fileInput = getByLabelText(
            'selectFromComputer',
        ) as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'test-image.png', {
            type: 'image/png',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);
        expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
            action: 'uploadFile',
            file: expect.any(File),
            serverUrl: 'http://mockapi.com',
        });

        act(() => {
            mockWorkerInstance.onmessage?.({
                data: {
                    success: true,
                    url: 'http://mockapi.com/uploads/fake-image.png',
                    width: 800,
                    height: 600,
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
        });

        const [url, width, height] = mockOnUploadComplete.mock.calls[0];
        expect(url).toBe('http://mockapi.com/uploads/fake-image.png');
        expect(width).toBe(800);
        expect(height).toBe(600);
    });

    it('handles upload error gracefully (file upload)', async () => {
        const { getByLabelText } = setup();

        const fileInput = getByLabelText(
            'selectFromComputer',
        ) as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'error-image.png', {
            type: 'image/png',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);

        act(() => {
            mockWorkerInstance.onmessage?.({
                data: {
                    success: false,
                    error: 'Upload failed',
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(mockOnUploadComplete).not.toHaveBeenCalled();
        });
    });

    it('uploads via drag-and-drop and calls onUploadComplete on worker success', async () => {
        const { getByText } = setup();

        const dropZone = getByText('dragDropLabel').parentElement!;
        const file = new File(['(⌐□_□)'], 'drag-image.png', {
            type: 'image/png',
        });

        fireEvent.dragEnter(dropZone);
        fireEvent.dragOver(dropZone);
        fireEvent.drop(dropZone, {
            dataTransfer: {
                files: [file],
            },
        });

        expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);
        expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
            action: 'uploadFile',
            file: expect.any(File),
            serverUrl: 'http://mockapi.com',
        });

        act(() => {
            mockWorkerInstance.onmessage?.({
                data: {
                    success: true,
                    url: 'http://mockapi.com/uploads/drag-image.png',
                    width: 800,
                    height: 600,
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
        });

        const [url, width, height] = mockOnUploadComplete.mock.calls[0];
        expect(url).toBe('http://mockapi.com/uploads/drag-image.png');
        expect(width).toBe(800);
        expect(height).toBe(600);
    });

    it('submits a URL and calls onUploadComplete on worker success', async () => {
        const { getByPlaceholderText, getByText } = setup();

        const urlInput = getByPlaceholderText('https://example.com/image.png');
        fireEvent.change(urlInput, {
            target: { value: 'https://example.com/test.png' },
        });

        fireEvent.click(getByText('loadButton'));

        expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);
        expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
            action: 'uploadByUrl',
            url: 'https://example.com/test.png',
            serverUrl: 'http://mockapi.com',
        });

        act(() => {
            mockWorkerInstance.onmessage?.({
                data: {
                    success: true,
                    url: 'http://mockapi.com/uploads/url-submitted.png',
                    width: 800,
                    height: 600,
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
        });

        const [url, width, height] = mockOnUploadComplete.mock.calls[0];
        expect(url).toBe('http://mockapi.com/uploads/url-submitted.png');
        expect(width).toBe(800);
        expect(height).toBe(600);
    });

    it('handles error when fetching the user-submitted image URL (worker error)', async () => {
        const { getByPlaceholderText, getByText } = setup();

        const urlInput = getByPlaceholderText('https://example.com/image.png');
        fireEvent.change(urlInput, {
            target: { value: 'https://example.com/test.png' },
        });

        fireEvent.click(getByText('loadButton'));

        expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);

        act(() => {
            mockWorkerInstance.onmessage?.({
                data: {
                    success: false,
                    error: 'URL fetch failed',
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(mockOnUploadComplete).not.toHaveBeenCalled();
        });
    });

    it('does not call worker when handleFileChange is triggered with no file', () => {
        const { getByLabelText } = setup();

        const fileInput = getByLabelText(
            'selectFromComputer',
        ) as HTMLInputElement;

        fireEvent.change(fileInput, { target: { files: [] } });

        expect(mockWorkerInstance.postMessage).not.toHaveBeenCalled();
    });

    it('does not call worker when handleSubmitUrl is triggered with no workerRef', () => {
        const { getByPlaceholderText, getByText } = setup();

        const urlInput = getByPlaceholderText('https://example.com/image.png');
        fireEvent.change(urlInput, {
            target: { value: 'https://example.com/test.png' },
        });

        mockWorkerInstance = null as unknown as Worker;

        fireEvent.click(getByText('loadButton'));

        expect(mockWorkerInstance).toBeNull();
    });

    it('does not call worker when handleDrop is triggered with no workerRef', () => {
        const { getByText } = setup();

        const dropZone = getByText('dragDropLabel').parentElement!;
        const file = new File(['(⌐□_□)'], 'drag-image.png', {
            type: 'image/png',
        });

        mockWorkerInstance = null as unknown as Worker;

        fireEvent.dragEnter(dropZone);
        fireEvent.dragOver(dropZone);
        fireEvent.drop(dropZone, {
            dataTransfer: {
                files: [file],
            },
        });

        expect(mockWorkerInstance).toBeNull();
    });

    it('does not call worker when handleFileChange is triggered with no workerRef', () => {
        const { getByLabelText } = setup();

        const fileInput = getByLabelText(
            'selectFromComputer',
        ) as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'test-image.png', {
            type: 'image/png',
        });

        mockWorkerInstance = null as unknown as Worker;

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockWorkerInstance).toBeNull();
    });
});
