import React, { useState } from 'react';

interface ImageUploadProps {
    onClose: () => void;
    onUploadComplete: (imageUrl: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    onClose,
    onUploadComplete,
}) => {
    const [imageUrl, setImageUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);

    // Mock function
    const uploadToServer = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        return Promise.resolve(URL.createObjectURL(file));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const finalUrl = await uploadToServer(file);
        onUploadComplete(finalUrl);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const finalUrl = await uploadToServer(file);
            onUploadComplete(finalUrl);
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
        onUploadComplete(imageUrl);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Inner wrapper stops clicks from closing if they click inside */}
            <div
                className="relative bg-white rounded-lg p-6 w-96"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">
                    Upload or Paste an Image
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
                    <p className="mb-2">Drag & Drop Image Here</p>
                    <p>or</p>
                    <label className="mt-2 inline-block cursor-pointer text-blue-600 hover:underline">
                        <span>Select from computer</span>
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
                        Image URL
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
                            Load
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
