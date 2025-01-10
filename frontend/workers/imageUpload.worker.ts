self.onmessage = async (event) => {
    const { file } = event.data as { file: File };

    if (!file) {
        self.postMessage({
            success: false,
            error: 'No file received in worker',
        });
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer]);

        const bitmap = await createImageBitmap(blob);

        self.postMessage({
            success: true,
            width: bitmap.width,
            height: bitmap.height,
        });
    } catch (error) {
        if (error instanceof Error) {
            self.postMessage({
                success: false,
                error: error.message ?? 'Error reading file in worker',
            });
        }
    }
};