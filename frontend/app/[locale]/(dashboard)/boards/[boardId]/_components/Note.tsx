import { NoteLayer, TextAlign, TextFormat } from '@/types/canvas';
import { colorToCss, getContrastingTextColor } from '@/lib/utils';
import {
    useState,
    useRef,
    useEffect,
    CSSProperties,
    useMemo,
    ChangeEvent,
} from 'react';
import { useMutation } from '@/liveblocks.config';
import { Fonts } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Fonts';

export const MIN_FONT_SIZE = 7;
export const MAX_FONT_SIZE = 72;

export const PLACEHOLDER_TEXT = 'Text';

export const PLACEHOLDER_COLOR = {
    light: '#aaa',
    dark: '#555',
};

export const padding = 0;

export const noSelect = {
    userSelect: 'none',
    cursor: 'default',
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
    const endOfLines = (text.match(/\n/g) || []).length;
    lines += endOfLines;

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

export function adjustElementSize(el: HTMLTextAreaElement, height: number) {
    el.style.height = 'auto';
    const style = window.getComputedStyle(el);
    if (isTextSingleLine(el, style)) {
        const lineHeight = parseFloat(style.lineHeight);
        el.style.height = `${Math.min(lineHeight, height)}px`;
    }

    let scrollHeight = el.scrollHeight;
    if (scrollHeight === 0) {
        scrollHeight = getOffscreenScrollHeight(el, style);
    }

    el.style.height = `${Math.min(scrollHeight, height)}px`;
}

function isTextSingleLine(
    textarea: HTMLTextAreaElement,
    style: CSSStyleDeclaration,
): boolean {
    const divHeight = getOffscreenScrollHeight(textarea, style);
    const lineHeight = parseFloat(style.lineHeight);
    return divHeight <= lineHeight;
}

function getOffscreenScrollHeight(
    element: HTMLTextAreaElement,
    style: CSSStyleDeclaration,
): number {
    const offscreenDiv = document.createElement('div');
    offscreenDiv.style.position = 'absolute';
    offscreenDiv.style.top = '-9999px';
    offscreenDiv.style.left = '-9999px';
    offscreenDiv.style.visibility = 'hidden';
    offscreenDiv.style.whiteSpace = 'pre-wrap';
    offscreenDiv.style.wordBreak = 'break-word';
    offscreenDiv.style.font = style.font;
    offscreenDiv.style.lineHeight = style.lineHeight;
    offscreenDiv.style.width = style.width;

    const lines = element.value.split('\n');
    let totalHeight = 0;

    lines.forEach((line) => {
        offscreenDiv.textContent = line || 'M'; // Handle empty lines
        document.body.appendChild(offscreenDiv);

        totalHeight += offscreenDiv.offsetHeight;

        document.body.removeChild(offscreenDiv);
    });
    return totalHeight;
}

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
        value = PLACEHOLDER_TEXT,
        fontName,
        fontSize,
        textAlign,
        textFormat,
    } = layer;

    const [currFontSize, setCurrFontSize] = useState(fontSize);
    const containerRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const [isInUse, setIsInUse] = useState(false);

    const updateValue = useMutation(
        ({ storage }, newValue: string) => {
            const liveLayers = storage.get('layers');
            liveLayers.get(id)?.set('value', newValue);
        },
        [id],
    );
    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
                contentWidth - padding * 2,
                contentHeight - padding * 2,
                value,
                fontSize,
                fontName,
            );

            if (newFontSize !== currFontSize) {
                setCurrFontSize(newFontSize);
            }
            adjustElementSize(textAreaRef.current!, height);
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

    const currSelectionCss = useMemo<CSSProperties>(() => {
        return isInUse ? noSelect : {};
    }, [isInUse]);

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
            wordBreak: 'keep-all',
            minHeight: '1.5rem',
            resize: 'none',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            boxSizing: 'border-box',
            height: textAreaRef.current
                ? textAreaRef.current.style.height
                : 'auto',
            width: `${width - padding * 2}px`,
            border: 'none',
            outline: 'none',
            padding: `${padding}px`,
            ...currSelectionCss,
        }),
        [
            currFontSize,
            value,
            textColor,
            placeholderTextColor,
            fontName,
            applyTextAlign,
            applyTextFormat,
            width,
            currSelectionCss,
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
                    padding: `${padding}px`,
                }}
                // @ts-expect-error: The xmlns will be added regardless of the type
                xmlns="http://www.w3.org/1999/xhtml"
            >
                <textarea
                    value={value || PLACEHOLDER_TEXT}
                    style={textStyle}
                    onFocus={() => setIsInUse(true)}
                    onBlur={() => setIsInUse(false)}
                    readOnly={!isInUse}
                    onChange={(e) => {
                        if (e.target) {
                            const target = e.target as HTMLTextAreaElement;

                            const newValue = target.value;
                            const currentHeight = target.scrollHeight;

                            // Value comparison allows deleting but not writing more text
                            if (
                                newValue.length >= value.length &&
                                currentHeight > height
                            ) {
                                e.preventDefault();
                                return;
                            }
                        }
                        handleContentChange(e);
                    }}
                    ref={textAreaRef}
                    data-placeholder={PLACEHOLDER_TEXT}
                    data-testid="note-content-editable"
                />
            </div>
        </foreignObject>
    );
};
