import { NoteLayer, TextAlign, TextFormat } from '@/types/canvas';
import { colorToCss, getContrastingTextColor } from '@/lib/utils';
import { useState, useRef, useEffect, CSSProperties, useMemo } from 'react';
import { useMutation } from '@/liveblocks.config';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { Fonts } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Fonts';

export const MIN_FONT_SIZE = 7;
export const MAX_FONT_SIZE = 72;

const PLACEHOLDER_TEXT = 'Text';

const PLACEHOLDER_COLOR = {
    light: '#aaa',
    dark: '#555',
};

export const padding = 5;

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
    if (!ctx) return initialFontSize;

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

    const [noteValue, setNoteValue] = useState(value || '');
    const [isEditing, setIsEditing] = useState(false);
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
        const newValue = e.target.value;
        setNoteValue(newValue);
        updateValue(newValue);
    };

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        if (noteValue.trim() === '') {
            setIsEditing(false);
        }
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
                contentWidth - padding * 2,
                contentHeight - padding * 2,
                noteValue || PLACEHOLDER_TEXT,
                fontSize,
                fontName,
            );

            if (newFontSize !== currFontSize) {
                setCurrFontSize(newFontSize);
            }
        }
    }, [width, height, currFontSize, fontSize, fontName, noteValue]);

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
            color: noteValue || isEditing ? textColor : placeholderTextColor,
            fontFamily: fontName,
            ...applyTextAlign,
            ...applyTextFormat,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: `${padding}px`,
            outline: 'none',
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }),
        [
            currFontSize,
            textColor,
            fontName,
            applyTextAlign,
            applyTextFormat,
            noteValue,
            isEditing,
            placeholderTextColor,
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
            }}
            className="shadow-md drop-shadow-xl"
            data-testid="note-foreign-object"
        >
            <div
                ref={containerRef}
                className="h-full w-full flex flex-col items-center justify-center text-center"
            >
                <ContentEditable
                    html={noteValue || (!isEditing ? PLACEHOLDER_TEXT : '')}
                    style={textStyle}
                    onChange={handleContentChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    data-placeholder={PLACEHOLDER_TEXT}
                    data-testid="note-content-editable"
                />
            </div>
        </foreignObject>
    );
};
