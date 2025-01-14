import { TextAlign, TextFormat, TextLayer } from '@/types/canvas';
import { colorToCss } from '@/lib/utils';
import { useMutation } from '@/liveblocks.config';
import React, {
    ChangeEvent,
    CSSProperties,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    adjustElementSize,
    calculateFontSize,
    noSelect,
    padding,
    PLACEHOLDER_COLOR,
    PLACEHOLDER_TEXT,
} from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';

interface TextProps {
    id: string;
    layer: TextLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
}

export const Text = ({ layer, onPointerDown, id }: TextProps) => {
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
        return { textAlign: alignmentMap[textAlign] || 'start' };
    }, [textAlign]);

    const textStyle = useMemo<CSSProperties>(
        () => ({
            fontSize: `${currFontSize}px`,
            color: fill && value ? colorToCss(fill) : PLACEHOLDER_COLOR.light,
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
            fill,
            value,
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
                backgroundColor: 'transparent',
                transform: `translate(${x}px, ${y}px) `,
                color: colorToCss(fill!),
                width: width,
                height: height,
            }}
            data-testid="text-foreign-object"
        >
            <div
                ref={containerRef}
                className=" flex flex-col justify-center"
                style={{
                    backgroundColor: 'transparent',
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
                    data-testid="text-content-editable"
                />
            </div>
        </foreignObject>
    );
};
