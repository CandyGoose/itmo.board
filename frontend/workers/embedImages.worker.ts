self.onmessage = async (event) => {
    const { type, images } = event.data as {
        type: 'start';
        images: string[];
    };

    if (type === 'start') {
        for (let i = 0; i < images.length; i++) {
            const url = images[i];
            try {
                const response = await fetch(url, { cache: 'no-cache' });
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch ${url}: ${response.statusText}`,
                    );
                }

                const blob = await response.blob();

                const base64DataURL = await blobToBase64(blob);

                postMessage({
                    index: i,
                    base64DataURL,
                });
            } catch (error) {
                if (error instanceof Error) {
                    postMessage({
                        index: i,
                        error:
                            error.message ??
                            `Error converting ${url} to base64`,
                    });
                }
            }
        }
    }
};

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Could not convert blob to base64 string'));
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
}
