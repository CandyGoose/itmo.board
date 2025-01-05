'use client';

import { Room } from '@/components/Room';
import { use } from 'react';
import { useStorage } from '@/liveblocks.config';
import { LayerPreview } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/LayerPreview';

interface SaverProps {
    params: Promise<{
        boardId: string;
    }>;
}

export default function CanvasSaver({ params }: SaverProps) {
    const { boardId } = use(params);

    return (
        <Room roomId={boardId} fallback={null}>
            <Renderer />
        </Room>
    );
}

function Renderer() {
    const layerIds = useStorage((root) => root.layerIds);

    return (
        <g data-testid="svg-group">
            {layerIds?.map((layerId) => (
                <LayerPreview
                    key={layerId}
                    id={layerId}
                    onLayerPointerDown={() => {}}
                    selectionColor={undefined}
                />
            ))}
        </g>
    );
}
