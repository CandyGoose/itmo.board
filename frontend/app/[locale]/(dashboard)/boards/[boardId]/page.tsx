'use client';

import { Room } from '@/components/Room';
import Canvas from './_components/Canvas';
import { CanvasLoading } from './_components/Loading';
import { use, useEffect } from 'react';
import { getBoardById } from '@/actions/Board';

interface PageProps {
    params: Promise<{
        boardId: string;
    }>;
}

export default function BoardPage({ params }: PageProps) {
    const { boardId } = use(params);

    return (
        <Room roomId={boardId} fallback={<CanvasLoading />}>
            <Canvas boardId={boardId} />
        </Room>
    );
}
