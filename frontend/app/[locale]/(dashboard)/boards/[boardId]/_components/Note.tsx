import { Kalam } from 'next/font/google';
import { NoteLayer, TextAlign, TextFormat } from '@/types/canvas';
import { cn, colorToCss, getContrastingTextColor } from '@/lib/utils';
import { useState, useRef, useEffect, CSSProperties } from 'react';

const font = Kalam({
    subsets: ['latin'],
    weight: ['400'],
});

export const MIN_FONT_SIZE = 7;
export const MAX_FONT_SIZE = 72;

export const calculateFontSize = (
    width: number,
    height: number,
    text: string,
) => {
    const scaleFactor = 0.15;

    const fontSizeBasedOnHeight = height * scaleFactor;
    const fontSizeBasedOnWidth = width * scaleFactor;

    let fontSize = Math.min(
        fontSizeBasedOnHeight,
        fontSizeBasedOnWidth,
        MAX_FONT_SIZE,
    );

    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'Kalam';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.whiteSpace = 'normal';
    testElement.style.fontSize = `${fontSize}px`;
    testElement.style.width = `${width}px`;
    testElement.style.wordBreak = 'break-word';
    testElement.textContent = text;
    document.body.appendChild(testElement);

    while (testElement.offsetHeight > height && fontSize >= MIN_FONT_SIZE) {
        fontSize -= 1;
        testElement.style.fontSize = `${fontSize}px`;
    }

    document.body.removeChild(testElement);
    return fontSize;
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
        value,
        fontName,
        fontSize: initialFontSize,
        textAlign,
        textFormat,
    } = layer;

    const [noteValue, setNoteValue] = useState(value || 'Text');
    const [fontSize, setFontSize] = useState(initialFontSize);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const newText = e.currentTarget.textContent || '';
        setNoteValue(newText);
    };

    const textColor = fill ? getContrastingTextColor(fill) : '#000';
    const backgroundColor = fill ? colorToCss(fill) : 'transparent';
    const outlineStyle = selectionColor
        ? `1px solid ${selectionColor}`
        : 'none';

    useEffect(() => {
        if (containerRef.current) {
            const contentWidth = containerRef.current.offsetWidth;
            const contentHeight = containerRef.current.offsetHeight;

            const newFontSize = calculateFontSize(
                contentWidth,
                contentHeight,
                noteValue,
            );

            if (newFontSize !== fontSize) {
                setFontSize(newFontSize);
            }
        }
    }, [noteValue, fontSize]);

    const applyTextFormat = (format: TextFormat[]): CSSProperties => {
        return {
            fontWeight: format.includes(TextFormat.Bold) ? 'bold' : undefined,
            fontStyle: format.includes(TextFormat.Italic) ? 'italic' : undefined,
            textDecoration: format.includes(TextFormat.Strike) ? 'line-through' : undefined,
        };
    };

    const applyTextAlign = (align: TextAlign): CSSProperties => {
        const alignmentMap: Record<TextAlign, CSSProperties> = {
            [TextAlign.Left]: { textAlign: 'start' },
            [TextAlign.Center]: { textAlign: 'center' },
            [TextAlign.Right]: { textAlign: 'end' },
        };
        return alignmentMap[align] || { textAlign: 'center' };
    };

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
            className="shadow-md drop-shadow-xl p-5"
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
                        fontName === 'Kalam' ? font : '', // includes the font
                    )}
                    style={{
                        fontSize: `${fontSize}px`,
                        color: textColor,
                        fontFamily: fontName,
                        ...applyTextAlign(textAlign),
                        ...applyTextFormat(textFormat),
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                    onInput={handleContentChange}
                />
            </div>
        </foreignObject>
    );
};
