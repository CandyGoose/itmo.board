'use client';

import { Room } from '@/components/Room';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStorage } from '@/liveblocks.config';
import { LayerPreview } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/LayerPreview';
import { boundingBox } from '@/hooks/useSelectionBounds';
import { Layer } from '@/types/canvas';

interface SaverProps {
    boardId: string;
}

export default function CanvasSaver({ boardId }: SaverProps) {
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

    const layers = layerIds
        .map((layerId) => storageLayers.get(layerId))
        .filter((layer): layer is Layer => Boolean(layer));
    const bounds = boundingBox(layers) || { x: 0, y: 0, width: 0, height: 0 };

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

    const scale = Math.min(
        bounds.width > 0 ? screenWidth / bounds.width : 1,
        bounds.height > 0 ? screenHeight / bounds.height : 1,
    );
    const translateX = bounds.width > 0 ? -bounds.x * scale : 0;
    const translateY = bounds.height > 0 ? -bounds.y * scale : 0;

    const downloadSVG = useCallback((serializedSVG: string) => {
        const svgBlob = new Blob([serializedSVG], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'canvas.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }, []);

    const downloadPNG = useCallback(
        (serializedSVG: string) => {
            const width = bounds.width * scale;
            const height = bounds.height * scale;

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.onload = function () {
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0);

                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = 'canvas.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            img.onerror = function () {
                console.error('Failed to load the SVG as an image.');
            };

            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serializedSVG);
        },
        [bounds.width, bounds.height],
    );

    useEffect(() => {
        function handleDownload(e: CustomEvent) {
            if (!svgRef.current) return;

            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgRef.current);

            if (
                !source.match(
                    /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,
                )
            ) {
                source = source.replace(
                    /^<svg/,
                    '<svg xmlns="http://www.w3.org/2000/svg"',
                );
            }
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

            const format = e.detail?.format;
            if (format === 'svg') {
                downloadSVG(source);
            } else if (format === 'png') {
                downloadPNG(source);
            }
        }

        window.addEventListener(
            'canvas-download',
            handleDownload as EventListener,
        );
        return () => {
            window.removeEventListener(
                'canvas-download',
                handleDownload as EventListener,
            );
        };
    }, [downloadPNG, downloadSVG]);

    return (
        <svg
            ref={svgRef}
            data-testid="svg-element"
            className="h-[100vh] w-[100vw]"
            width={screenWidth}
            height={screenHeight}
            xmlns="http://www.w3.org/2000/svg"
        >
            <g
                data-testid="svg-group"
                transform={`translate(${translateX}, ${translateY}) scale(${scale})`}
                width={bounds.width}
                height={bounds.height}
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
