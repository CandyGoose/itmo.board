import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ImageUpload } from './ImageUpload';
import '@testing-library/jest-dom';

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');

beforeAll(() => {
    global.fetch = jest.fn();
});

class MockImage {
    width = 800;
    height = 600;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor() {
        setTimeout(() => {
            if (this.onload) {
                this.onload();
            }
        }, 10);
    }

    set src(_url: string) {}
}

Object.defineProperty(window, 'Image', {
    writable: true,
    configurable: true,
    value: MockImage,
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

    it('uploads a file (select from computer) and calls onUploadComplete with the correct URL and dimensions', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                url: 'http://mockapi.com/uploads/fake-image.png',
            }),
        } as Response);

        const { getByLabelText } = setup();

        const fileInput = getByLabelText(
            'selectFromComputer',
        ) as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'test-image.png', {
            type: 'image/png',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
        });

        const [url, width, height] = mockOnUploadComplete.mock.calls[0];
        expect(url).toBe('http://mockapi.com/uploads/fake-image.png');
        expect(width).toBe(800);
        expect(height).toBe(600);
    });

    it('handles upload error gracefully (file upload)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
        } as Response);

        const { getByLabelText } = setup();

        const fileInput = getByLabelText(
            'selectFromComputer',
        ) as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'error-image.png', {
            type: 'image/png',
        });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnUploadComplete).not.toHaveBeenCalled();
        });
    });

    it('uploads via drag-and-drop and calls onUploadComplete', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                url: 'http://mockapi.com/uploads/drag-image.png',
            }),
        } as Response);

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

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
        });
        const [url, width, height] = mockOnUploadComplete.mock.calls[0];
        expect(url).toBe('http://mockapi.com/uploads/drag-image.png');
        expect(width).toBe(800);
        expect(height).toBe(600);
    });

    it('submits a URL and calls onUploadComplete', async () => {
        // The first fetch will return a blob.
        (global.fetch as jest.Mock).mockImplementationOnce(async () => ({
            ok: true,
            blob: async () =>
                new Blob(['dummy-image-content'], { type: 'image/png' }),
        }));

        // The second fetch call for the upload
        (global.fetch as jest.Mock).mockImplementationOnce(async () => ({
            ok: true,
            json: async () => ({
                url: 'http://mockapi.com/uploads/url-submitted.png',
            }),
        }));

        const { getByPlaceholderText, getByText } = setup();

        const urlInput = getByPlaceholderText('https://example.com/image.png');
        fireEvent.change(urlInput, {
            target: { value: 'https://example.com/test.png' },
        });

        fireEvent.click(getByText('loadButton'));

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
        });
        const [url, width, height] = mockOnUploadComplete.mock.calls[0];
        expect(url).toBe('http://mockapi.com/uploads/url-submitted.png');
        expect(width).toBe(800);
        expect(height).toBe(600);
    });

    it('handles error when fetching the user-submitted image URL', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
        } as Response);

        const { getByPlaceholderText, getByText } = setup();

        const urlInput = getByPlaceholderText('https://example.com/image.png');
        fireEvent.change(urlInput, {
            target: { value: 'https://example.com/test.png' },
        });

        fireEvent.click(getByText('loadButton'));

        await waitFor(() => {
            expect(mockOnUploadComplete).not.toHaveBeenCalled();
        });
    });
});
