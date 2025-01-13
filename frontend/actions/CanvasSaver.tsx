'use client';

import { Room } from '@/components/Room';
import React, { useCallback, useEffect, useRef } from 'react';
import { useStorage } from '@/liveblocks.config';
import { LayerPreview } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/LayerPreview';
import { boundingBox } from '@/hooks/useSelectionBounds';
import { Layer } from '@/types/canvas';
import Script from 'next/script';

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

export async function embedImagesInSVG(
    svgElement: SVGSVGElement,
): Promise<void> {
    const imageElements = Array.from(svgElement.querySelectorAll('image'));

    const imagesToConvert = imageElements
        .map((img, index) => ({
            index,
            url: img.getAttribute('href'),
            element: img,
        }))
        .filter((item) => item.url && !item.url.startsWith('data:')) as Array<{
        index: number;
        url: string;
        element: SVGImageElement;
    }>;

    if (imagesToConvert.length < 1) return;

    const worker = new Worker('/workers/embedImages.worker.js');

    await new Promise<void>((resolve, reject) => {
        let remaining = imagesToConvert.length;

        worker.postMessage({
            type: 'start',
            images: imagesToConvert.map((item) => item.url),
        });

        worker.onmessage = (event) => {
            const { index, base64DataURL, error } = event.data as {
                index: number;
                base64DataURL?: string;
                error?: string;
            };

            if (error) {
                console.error(`Error for image at index ${index}: ${error}`);
            } else if (base64DataURL) {
                imagesToConvert[index].element.setAttribute(
                    'href',
                    base64DataURL,
                );
            }

            remaining -= 1;
            if (remaining === 0) {
                worker.terminate();
                resolve();
            }
        };

        worker.onerror = (errorEvent) => {
            console.error('Worker error:', errorEvent);
            worker.terminate();
            reject(errorEvent);
        };
    });
}

const applyComputedStyles = (
    sourceElement: Element,
    targetElement: Element,
) => {
    const excludedTestIds = ['svg-element', 'svg-group'];

    if (
        !excludedTestIds.includes(
            sourceElement.getAttribute('data-testid') || '',
        )
    ) {
        const transformStyle = sourceElement
            .getAttribute('style')
            ?.match(/transform:\s*([^;]+)/)?.[1]; // Ensure transform is applied for Chromium-based browsers

        const computedStyles = window.getComputedStyle(sourceElement);
        const styleString =
            Array.from(computedStyles)
                .map(
                    (prop) =>
                        `${prop}: ${computedStyles.getPropertyValue(prop)};`,
                )
                .join(' ') +
            (transformStyle ? ` transform: ${transformStyle};` : '');

        targetElement.setAttribute('style', styleString);
    }

    // Recursively apply to children
    Array.from(sourceElement.children).forEach((child, index) => {
        applyComputedStyles(child, targetElement.children[index]);
    });
};

function Renderer() {
    const svgRef = useRef<SVGSVGElement>(null);
    const layerIds = useStorage((root) => root.layerIds);
    const storageLayers = useStorage((root) => root.layers);

    const layers = layerIds
        .map((layerId) => storageLayers.get(layerId))
        .filter((layer): layer is Layer => Boolean(layer));
    const bounds = boundingBox(layers) || { x: 0, y: 0, width: 0, height: 0 };

    const translateX = bounds.width > 0 ? -bounds.x : 0;
    const translateY = bounds.height > 0 ? -bounds.y : 0;

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
            const width = bounds.width;
            const height = bounds.height;

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

            img.src =
                'data:image/svg+xml;charset=utf-8,' +
                encodeURIComponent(serializedSVG);
        },
        [bounds.width, bounds.height],
    );

    useEffect(() => {
        function handleDownload(e: CustomEvent) {
            if (!svgRef.current) return;
            const serializer = new XMLSerializer();
            const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
            applyComputedStyles(svgRef.current, svgClone);
            embedImagesInSVG(svgClone).then(() => {
                let source = serializer.serializeToString(svgClone);
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
            });
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
        <>
            <Script src="/workers/embedImages.worker.js" strategy="worker" />
            <svg
                ref={svgRef}
                data-testid="svg-element"
                width={bounds.width}
                height={bounds.height}
                xmlns="http://www.w3.org/2000/svg"
            >
                <g
                    data-testid="svg-group"
                    transform={`translate(${translateX}, ${translateY})`}
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
        </>
    );
}
