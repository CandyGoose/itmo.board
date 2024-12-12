import { Kalam } from 'next/font/google';
import { ContentEditableEvent } from 'react-contenteditable';
import { NoteLayer } from '@/types/canvas';
import { cn, colorToCss, getContrastingTextColor } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

const font = Kalam({
    subsets: ['latin'],
    weight: ['400'],
});

export const calculateFontSize = (
    width: number,
    height: number,
    text: string,
) => {
    const maxFontSize = 72;
    const minFontSize = 7;
    const scaleFactor = 0.15;

    const fontSizeBasedOnHeight = height * scaleFactor;
    const fontSizeBasedOnWidth = width * scaleFactor;

    let fontSize = Math.min(
        fontSizeBasedOnHeight,
        fontSizeBasedOnWidth,
        maxFontSize,
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

    while (testElement.offsetHeight > height && fontSize >= minFontSize) {
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
    const { x, y, width, height, fill, value } = layer;
    const [noteValue, setNoteValue] = useState(value || 'Text');
    const [fontSize, setFontSize] = useState(72);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    const handleContentChange = (e: ContentEditableEvent) => {
        if (inputRef.current) {
            inputRef.current.textContent = e.currentTarget.textContent;
        }
        setNoteValue(e.currentTarget.textContent || '');
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
                setFontSize(() => newFontSize);
            }
        }
    }, [noteValue, fontSize, width, height]);

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
                className="h-full w-full flex flex-col items-center justify-center text-center"
                style={{
                    backgroundColor: backgroundColor,
                }}
            >
                <div
                    contentEditable
                    ref={inputRef}
                    className={cn(
                        'h-full w-full flex flex-col items-center justify-center text-center outline-none',
                        font.className,
                    )}
                    style={{
                        fontSize: `${fontSize}px`,
                        color: textColor,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                    onInput={handleContentChange}
                />
            </div>
        </foreignObject>
    );
};
