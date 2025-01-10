import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface ImageUploadProps {
    onClose: () => void;
    onUploadComplete: (url: string, width?: number, height?: number) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = memo(
    ({ onClose, onUploadComplete }) => {
        const t = useTranslations('tools');
        const [imageUrl, setImageUrl] = useState('');
        const [dragActive, setDragActive] = useState(false);
        const workerRef = useRef<Worker | null>(null);

        useEffect(() => {
            workerRef.current = new Worker('/workers/imageUpload.worker.js');
            const w = workerRef.current;
            w.onmessage = (event) => {
                const { success, url, width, height, error } = event.data;
                if (success) {
                    onUploadComplete(url, width, height);
                } else {
                    toast.error(error);
                }
            };
            return () => {
                w.terminate();
            };
        }, [onUploadComplete]);

        const handleFileChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file || !workerRef.current) return;
                workerRef.current.postMessage({
                    action: 'uploadFile',
                    file,
                    serverUrl: process.env.NEXT_PUBLIC_API_URL,
                });
            },
            [],
        );

        const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (!workerRef.current) return;
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            workerRef.current.postMessage({
                action: 'uploadFile',
                file,
                serverUrl: process.env.NEXT_PUBLIC_API_URL,
            });
        }, []);

        const handleDragOver = useCallback(
            (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
            },
            [],
        );

        const handleDragEnter = useCallback(
            (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
            },
            [],
        );

        const handleDragLeave = useCallback(
            (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
            },
            [],
        );

        const handleSubmitUrl = useCallback(() => {
            if (!imageUrl || !workerRef.current) return;
            workerRef.current.postMessage({
                action: 'uploadByUrl',
                url: imageUrl,
                serverUrl: process.env.NEXT_PUBLIC_API_URL,
            });
        }, [imageUrl]);

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                onClick={onClose}
                data-testid="backdrop"
            >
                <div
                    className="relative bg-white rounded-lg p-6 w-96"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-4">
                        {t('uploadOrPasteAnImage')}
                    </h2>
                    <div
                        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                            dragActive
                                ? 'bg-gray-100 border-blue-400'
                                : 'border-gray-300'
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <p className="mb-2">{t('dragDropLabel')}</p>
                        <p>{t('orLabel')}</p>
                        <label className="mt-2 inline-block cursor-pointer text-blue-600 hover:underline">
                            <span>{t('selectFromComputer')}</span>
                            <input
                                className="hidden"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('imageUrl')}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded px-2 py-1"
                                placeholder="https://example.com/image.png"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                            <button
                                type="button"
                                className="bg-blue-600 text-white rounded px-4 py-1"
                                onClick={handleSubmitUrl}
                            >
                                {t('loadButton')}
                            </button>
                        </div>
                    </div>
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        data-testid="close-button"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    },
);

ImageUpload.displayName = 'ImageUpload';
