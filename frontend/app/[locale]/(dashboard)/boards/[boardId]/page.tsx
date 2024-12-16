'use client';

import { Room } from "@/components/Room";
import Canvas from './_components/Canvas';
import { CanvasLoading } from "./_components/Loading";

interface PageProps {
    params: {
        boardId: string;
    };
}

export default function BoardPage({ params }: PageProps) {
    const { boardId } = params;

    return (
        <Room roomId={boardId} fallback={<CanvasLoading />}>
            <Canvas boardId={boardId} />
        </Room>
    );
}
