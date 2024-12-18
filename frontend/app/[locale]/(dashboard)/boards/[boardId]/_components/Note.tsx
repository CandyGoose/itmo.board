import { Kalam } from 'next/font/google';
import { NoteLayer, TextAlign, TextFormat } from '@/types/canvas';
import { cn, colorToCss, getContrastingTextColor } from '@/lib/utils';
import {
    useState,
    useRef,
    useEffect,
    CSSProperties,
    useCallback,
    useMemo,
} from 'react';

const font = Kalam({
    subsets: ['latin'],
    weight: ['400'],
});

export const MIN_FONT_SIZE = 7;
export const MAX_FONT_SIZE = 72;

function doesTextFit(
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
    initialFontSize = 72,
    fontName = 'Kalam',
) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return MIN_FONT_SIZE; // fallback

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
        value = '',
        fontName,
        fontSize,
        textAlign,
        textFormat,
    } = layer;

    const [noteValue, setNoteValue] = useState(value);
    const [currFontSize, setCurrFontSize] = useState(fontSize);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    const handleContentChange = useCallback(
        (e: React.FormEvent<HTMLDivElement>) => {
            setNoteValue(e.currentTarget.textContent || '');
        },
        [],
    );

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
            const contentWidth = containerRef.current.offsetWidth;
            const contentHeight = containerRef.current.offsetHeight;

            const newFontSize = calculateFontSize(
                contentWidth,
                contentHeight,
                noteValue || 'Text',
                fontSize,
                fontName,
            );

            if (newFontSize !== currFontSize) {
                setCurrFontSize(newFontSize);
            }
        }
    }, [noteValue, width, height, currFontSize, fontSize, fontName]);

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

    const textStyle = useMemo<CSSProperties>(
        () => ({
            fontSize: `${currFontSize}px`,
            color: textColor,
            fontFamily: fontName,
            ...applyTextAlign,
            ...applyTextFormat,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
        }),
        [currFontSize, textColor, fontName, applyTextAlign, applyTextFormat],
    );

    const placeholderStyle = useMemo<CSSProperties>(
        () => ({
            ...textStyle,
            color: '#aaa', // Placeholder color
        }),
        [textStyle],
    );

    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: outlineStyle,
                backgroundColor: backgroundColor,
            }}
            className="shadow-md drop-shadow-xl"
            data-testid="note-foreign-object"
        >
            <div
                ref={containerRef}
                className="h-full w-full flex flex-col items-center justify-center"
                style={{
                    backgroundColor: backgroundColor,
                }}
            >
                <div
                    contentEditable
                    ref={inputRef}
                    className={cn(
                        'h-full w-full flex flex-col justify-center outline-none',
                        fontName === 'Kalam' ? font.className : '',
                    )}
                    style={textStyle}
                    onInput={handleContentChange}
                    data-placeholder="Text"
                    suppressContentEditableWarning
                >
                    {noteValue === '' && (
                        <span style={placeholderStyle}>Text</span>
                    )}
                </div>
            </div>
        </foreignObject>
    );
};
