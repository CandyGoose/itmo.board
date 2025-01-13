import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { TextAlign, TextFormat, TextLayer } from '@/types/canvas';
import { colorToCss } from '@/lib/utils';
import { useMutation } from '@/liveblocks.config';
import React, {
    CSSProperties,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    calculateFontSize,
    padding,
} from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';

interface TextProps {
    id: string;
    layer: TextLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
}

const PLACEHOLDER_COLOR = '#aaa';

export const Text = ({ layer, onPointerDown, id }: TextProps) => {
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
        return { textAlign: alignmentMap[textAlign] || 'start' };
    }, [textAlign]);

    const textStyle = useMemo<CSSProperties>(
        () => ({
            fontSize: `${currFontSize}px`,
            color: fill && value ? colorToCss(fill) : PLACEHOLDER_COLOR,
            fontFamily: fontName,
            ...applyTextAlign,
            ...applyTextFormat,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            backgroundColor: 'transparent',
            padding: `${padding}px`,
            boxSizing: 'border-box',
        }),
        [currFontSize, fill, value, fontName, applyTextAlign, applyTextFormat],
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
                padding: `${padding}px`,
            }}
            className="shadow-md drop-shadow-xl"
            data-testid="text-foreign-object"
        >
            <div
                ref={containerRef}
                className=" flex flex-col justify-center"
                style={{
                    backgroundColor: 'transparent',
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
                    data-testid="text-content-editable"
                />
            </div>
        </foreignObject>
    );
};
