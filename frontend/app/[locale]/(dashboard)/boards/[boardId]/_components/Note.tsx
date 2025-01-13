import { NoteLayer, TextAlign, TextFormat } from '@/types/canvas';
import { colorToCss, getContrastingTextColor } from '@/lib/utils';
import { useState, useRef, useEffect, CSSProperties, useMemo } from 'react';
import { useMutation } from '@/liveblocks.config';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { Fonts } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Fonts';

export const MIN_FONT_SIZE = 7;
export const MAX_FONT_SIZE = 72;

const PLACEHOLDER_COLOR = {
    light: '#aaa',
    dark: '#555',
};

export function doesTextFit(
    ctx: CanvasRenderingContext2D,
    text: string,
    width: number,
    height: number,
    fontSize: number,
    fontName: string,
) {
    ctx.font = `${fontSize}px ${fontName}`;
    const lineHeight = fontSize * 1.5;

    const words = text.split(/\s+/);
    let currentLine = '';
    let lines = 1;
    let maxLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > width) {
            // Break line
            currentLine = words[i];
            lines++;
            const newMetrics = ctx.measureText(currentLine);
            maxLineWidth = Math.max(maxLineWidth, newMetrics.width);
            if (lines * lineHeight > height) {
                return false;
            }
        } else {
            currentLine = testLine;
            maxLineWidth = Math.max(maxLineWidth, testWidth);
        }

        if (maxLineWidth > width) {
            return false;
        }
    }

    // Final check of total height
    const totalHeight = lines * lineHeight;
    return totalHeight <= height;
}

export const calculateFontSize = (
    width: number,
    height: number,
    text: string,
    initialFontSize = MAX_FONT_SIZE,
    fontName = Fonts[0],
) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return initialFontSize; // fallback

    let low = MIN_FONT_SIZE;
    let high = Math.min(initialFontSize, MAX_FONT_SIZE);
    let bestFit = low;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (doesTextFit(ctx, text, width, height, mid, fontName)) {
            bestFit = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return bestFit;
};

interface NoteProps {
    id: string;
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const Note = ({
    layer,
    onPointerDown,
    id,
    selectionColor,
}: NoteProps) => {
    const {
        x,
        y,
        width,
        height,
        fill,
        value = 'Text',
        fontName,
        fontSize,
        textAlign,
        textFormat,
    } = layer;

    const [currFontSize, setCurrFontSize] = useState(fontSize);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateValue = useMutation(
        ({ storage }, newValue: string) => {
            const liveLayers = storage.get('layers');
            liveLayers.get(id)?.set('value', newValue);
        },
        [id],
    );
    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
    };

    const textColor = useMemo(
        () => (fill ? getContrastingTextColor(fill) : '#000'),
        [fill],
    );
    const backgroundColor = useMemo(
        () => (fill ? colorToCss(fill) : 'transparent'),
        [fill],
    );
    const outlineStyle = useMemo(
        () => (selectionColor ? `1px solid ${selectionColor}` : 'none'),
        [selectionColor],
    );

    useEffect(() => {
        setCurrFontSize(fontSize);
    }, [fontSize]);

    useEffect(() => {
        if (containerRef.current) {
            const contentWidth = containerRef.current.offsetWidth || width;
            const contentHeight = containerRef.current.offsetHeight || height;

            const newFontSize = calculateFontSize(
                contentWidth,
                contentHeight,
                value,
                fontSize,
                fontName,
            );

            if (newFontSize !== currFontSize) {
                setCurrFontSize(newFontSize);
            }
        }
    }, [width, height, currFontSize, fontSize, fontName, value]);

    const applyTextFormat = useMemo<CSSProperties>(() => {
        const styles: CSSProperties = {};
        if (textFormat.includes(TextFormat.Bold)) styles.fontWeight = 'bold';
        if (textFormat.includes(TextFormat.Italic)) styles.fontStyle = 'italic';
        if (textFormat.includes(TextFormat.Strike))
            styles.textDecoration = 'line-through';
        return styles;
    }, [textFormat]);

    const applyTextAlign = useMemo<CSSProperties>(() => {
        const alignmentMap: Record<TextAlign, CSSProperties['textAlign']> = {
            [TextAlign.Left]: 'start',
            [TextAlign.Center]: 'center',
            [TextAlign.Right]: 'end',
        };
        return { textAlign: alignmentMap[textAlign] || 'center' };
    }, [textAlign]);

    const placeholderTextColor = useMemo(() => {
        const baseColor = fill ? getContrastingTextColor(fill) : '#000';
        return baseColor === '#000' || baseColor === 'black'
            ? PLACEHOLDER_COLOR.dark
            : PLACEHOLDER_COLOR.light;
    }, [fill]);

    const textStyle = useMemo<CSSProperties>(
        () => ({
            fontSize: `${currFontSize}px`,
            color: value ? textColor : placeholderTextColor,
            fontFamily: fontName,
            ...applyTextAlign,
            ...applyTextFormat,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: '0.5rem',
        }),
        [
            currFontSize,
            textColor,
            fontName,
            applyTextAlign,
            applyTextFormat,
            placeholderTextColor,
            value,
        ],
    );

    return (
        <foreignObject
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: outlineStyle,
                backgroundColor: backgroundColor,
                transform: `translate(${x}px, ${y}px) `,
                color: textColor,
                width: width,
                height: height,
            }}
            className="shadow-md drop-shadow-xl"
            data-testid="note-foreign-object"
        >
            <div
                ref={containerRef}
                className="flex flex-col justify-center"
                style={{
                    backgroundColor: backgroundColor,
                    height: height,
                    width: width,
                }}
                // @ts-expect-error: The xmlns will be added regardless of the type
                xmlns="http://www.w3.org/1999/xhtml"
            >
                <ContentEditable
                    html={value || 'Text'}
                    style={textStyle}
                    onChange={handleContentChange}
                    data-placeholder="Text"
                    data-testid="note-content-editable"
                />
            </div>
        </foreignObject>
    );
};
