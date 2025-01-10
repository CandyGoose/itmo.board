self.onmessage = async (e) => {
    const { action, file, url, serverUrl } = e.data as {
        action: 'uploadFile' | 'uploadByUrl';
        file?: File;
        url?: string;
        serverUrl: string;
    };

    try {
        if (action === 'uploadFile') {
            if (!file) throw new Error('No file');
            const arrayBuffer = await file.arrayBuffer();
            const blob = new Blob([arrayBuffer]);
            const bitmap = await createImageBitmap(blob);

            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${serverUrl}/uploads`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            self.postMessage({
                success: true,
                url: data.url,
                width: bitmap.width,
                height: bitmap.height,
            });
        } else if (action === 'uploadByUrl') {
            if (!url) throw new Error('No URL');

            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Failed to fetch image from URL');

            const blob = await response.blob();
            const fileFromUrl = new File([blob], 'downloaded-image', {
                type: blob.type,
            });

            const arrayBuffer = await fileFromUrl.arrayBuffer();
            const blobFromUrl = new Blob([arrayBuffer]);
            const bitmap = await createImageBitmap(blobFromUrl);

            const formData = new FormData();
            formData.append('file', fileFromUrl);
            const res = await fetch(`${serverUrl}/uploads`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            self.postMessage({
                success: true,
                url: data.url,
                width: bitmap.width,
                height: bitmap.height,
            });
        }
    } catch (err) {
        if (err instanceof Error) {
            self.postMessage({
                success: false,
                error: err.message || 'Worker error',
            });
        }
    }
};
