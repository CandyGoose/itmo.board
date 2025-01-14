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
const PLACEHOLDER_TEXT = 'Text';

export const Text = ({ layer, onPointerDown, id }: TextProps) => {
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

    const [textValue, setTextValue] = useState(value || '');
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
        setTextValue(newValue);
        updateValue(newValue);
    };

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        if (textValue.trim() === '') {
            setIsEditing(false);
        }
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
                textValue || PLACEHOLDER_TEXT,
                fontSize,
                fontName,
            );

            if (newFontSize !== currFontSize) {
                setCurrFontSize(newFontSize);
            }
        }
    }, [width, height, currFontSize, fontSize, fontName, textValue]);

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
            color:
                fill && (textValue || isEditing)
                    ? colorToCss(fill)
                    : PLACEHOLDER_COLOR,
            fontFamily: fontName,
            ...applyTextAlign,
            ...applyTextFormat,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: `${padding}px`,
            boxSizing: 'border-box',
            outline: 'none',
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }),
        [
            currFontSize,
            fill,
            textValue,
            isEditing,
            fontName,
            applyTextAlign,
            applyTextFormat,
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
            }}
            data-testid="text-foreign-object"
        >
            <div
                ref={containerRef}
                className="h-full w-full flex flex-col items-center justify-center text-center"
            >
                <ContentEditable
                    html={textValue || (!isEditing ? PLACEHOLDER_TEXT : '')}
                    style={textStyle}
                    onChange={handleContentChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    data-placeholder={PLACEHOLDER_TEXT}
                    data-testid="text-content-editable"
                />
            </div>
        </foreignObject>
    );
};
