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

            const res = await fetch(`${serverUrl}/uploads-by-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) throw new Error(`Server error while uploading by URL`);

            const data = await res.json();

            const imgBlob = await fetch(data.url).then((r) => r.blob());
            const bitmap = await createImageBitmap(imgBlob);

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
