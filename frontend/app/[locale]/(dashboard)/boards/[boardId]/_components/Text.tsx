import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { TextAlign, TextFormat, TextLayer } from '@/types/canvas';
import { cn, colorToCss } from '@/lib/utils';
import { useMutation } from '@/liveblocks.config';
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    font
} from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';

interface TextProps {
    id: string;
    layer: TextLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const Text = ({
                         layer,
                         onPointerDown,
                         id,
                         selectionColor,
                     }: TextProps) => {
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

    const [currValue, setCurrValue] = useState(value);
    const [currWidth, setCurrWidth] = useState(width);
    const [currFontSize, setCurrFontSize] = useState(fontSize);

    const containerRef = useRef<HTMLDivElement>(null);

    const updateValue = useMutation(({ storage }, newValue: string) => {
        const liveLayers = storage.get('layers');
        liveLayers.get(id)?.set('value', newValue);
    }, []);

    const handleContentChange = (e: ContentEditableEvent) => {
        const newValue = e.target.value;
        setCurrValue(newValue);
        updateValue(newValue);
    };

    useEffect(() => {
        setCurrFontSize(fontSize);
        setCurrWidth(width);
        setCurrValue(value);
    }, [fontSize, width, value]);

    const textStyle: {
        fontSize: string;
        color: string;
        fontFamily: string;
        whiteSpace: string;
        wordBreak: string;
        textAlign: string | TextAlign.Left | TextAlign.Right;
        fontWeight: string;
        fontStyle: string;
        textDecoration: string
    } = useMemo(() => ({
        fontSize: `${currFontSize}px`,
        color: fill ? colorToCss(fill) : '#aaa',
        fontFamily: fontName,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        textAlign: textAlign === TextAlign.Center ? 'center' : textAlign,
        fontWeight: textFormat.includes(TextFormat.Bold) ? 'bold' : 'normal',
        fontStyle: textFormat.includes(TextFormat.Italic) ? 'italic' : 'normal',
        textDecoration: textFormat.includes(TextFormat.Strike)
            ? 'line-through'
            : 'none',
    }), [currFontSize, fill, fontName, textAlign, textFormat]);

    return (
        <foreignObject
            x={x}
            y={y}
            width={currWidth}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: selectionColor ? `1px solid ${selectionColor}` : 'none',
                backgroundColor: 'transparent',
            }}
        >
            <div
                ref={containerRef}
                className="h-full flex items-center justify-center"
                style={{ width: `${currWidth}px` }}
            >
                <ContentEditable
                    html={currValue}
                    onChange={handleContentChange}
                    className={cn(
                        'h-full w-full flex items-center justify-center text-center outline-none',
                        font.className,
                    )}
                    style={textStyle}
                />
            </div>
        </foreignObject>
    );
};
