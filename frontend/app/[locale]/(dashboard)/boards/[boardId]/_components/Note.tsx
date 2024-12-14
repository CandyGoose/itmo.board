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

export const calculateFontSize = (
    width: number,
    height: number,
    text: string,
    initialFontSize = 72,
    fontName = 'Kalam',
) => {
    let fontSize = Math.min(initialFontSize, MAX_FONT_SIZE);

    const testElement = document.createElement('div');
    testElement.style.fontFamily = fontName;
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.whiteSpace = 'normal';
    testElement.style.width = `${width}px`;
    testElement.style.wordBreak = 'break-word';
    testElement.textContent = text;
    document.body.appendChild(testElement);

    testElement.style.fontSize = `${fontSize}px`;

    while (
        (testElement.offsetHeight > height ||
            testElement.scrollWidth > width) &&
        fontSize > MIN_FONT_SIZE
    ) {
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
        value = 'Text',
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
                noteValue,
                fontSize,
                fontName,
            );

            if (newFontSize !== currFontSize) {
                setCurrFontSize(newFontSize);
            }
        }
    }, [noteValue, width, height, currFontSize, fontSize, fontName]);

    useEffect(() => {
        if (inputRef.current) {
            const val =
                layer.value && layer.value !== '' ? layer.value : 'Text';
            inputRef.current.textContent = val;
            setNoteValue(val);
        }
    }, [layer.value]);

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
            whiteSpace: 'normal',
            wordBreak: 'break-word',
        }),
        [currFontSize, textColor, fontName, applyTextAlign, applyTextFormat],
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
                        fontName === 'Kalam' ? font.className : '',
                    )}
                    style={textStyle}
                    onInput={handleContentChange}
                />
            </div>
        </foreignObject>
    );
};
