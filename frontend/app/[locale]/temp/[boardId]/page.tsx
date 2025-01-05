'use client';

import { Room } from '@/components/Room';
import { use, useEffect, useRef, useState } from 'react';
import { useStorage } from '@/liveblocks.config';
import { LayerPreview } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/LayerPreview';
import { boundingBox } from '@/hooks/useSelectionBounds';
import { Layer } from '@/types/canvas'

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
    const svgRef = useRef<SVGSVGElement>(null);
    const layerIds = useStorage((root) => root.layerIds);
    const storageLayers = useStorage((root) => root.layers);

    const layers = layerIds.map((layerId) => storageLayers.get(layerId)).filter((layer): layer is Layer => Boolean(layer));
    const bounds = boundingBox(layers);

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        console.log("Bounds: ", bounds);
        console.log("Screen width: ", screenWidth);
        console.log("Screen height: ", screenHeight);
    }, [bounds, screenHeight, screenWidth]);

    return (
        <svg
            ref={svgRef}
            data-testid="svg-element"
            className="h-[100vh] w-[100vw]"
        >
            <g
                data-testid="svg-group"
                transform={`translate(${-bounds!.x}, ${-bounds!.y}) scale(${1})`}
            >
                {layerIds?.map((layerId) => (
                    <LayerPreview
                        key={layerId}
                        id={layerId}
                        onLayerPointerDown={() => {}}
                        selectionColor={undefined}
                    />
                ))}
            </g>
        </svg>
    );
}
