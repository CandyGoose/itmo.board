'use client';

import Canvas from './_components/Canvas';
import { useEffect, useState } from 'react';

interface PageProps {
    params: Promise<{ boardId: string }>;
}

export default function BoardPage({ params }: PageProps) {
    const [boardId, setBoardId] = useState<string | null>(null);

    useEffect(() => {
        params.then((data) => setBoardId(data.boardId));
    }, [params]);

    if (!boardId) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Canvas boardId={boardId} />
        </div>
    );
}
