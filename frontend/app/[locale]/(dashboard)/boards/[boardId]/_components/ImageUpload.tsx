import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ImageUploadProps {
    onClose: () => void;
    onUploadComplete: (imageUrl: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    onClose,
    onUploadComplete,
}) => {
    const t = useTranslations('tools');

    const [imageUrl, setImageUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const uploadToServer = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Upload failed');
        }
        const data = await res.json();
        // data should be like: { url: "http://localhost:4000/uploads/167233_myImage.png" }
        return data.url;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const finalUrl = await uploadToServer(file);
            onUploadComplete(finalUrl);
        } catch (err) {
            console.error('File upload error:', err);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            try {
                const finalUrl = await uploadToServer(file);
                onUploadComplete(finalUrl);
            } catch (err) {
                console.error('File upload error:', err);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleSubmitUrl = async () => {
        // No upload on URL
        onUploadComplete(imageUrl);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-lg p-6 w-96"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">
                    {t('uploadOrPasteAnImage')}
                </h2>

                {/* DRAG & DROP AREA */}
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

                {/* PASTE A URL */}
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

                {/* CANCEL BUTTON */}
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};
