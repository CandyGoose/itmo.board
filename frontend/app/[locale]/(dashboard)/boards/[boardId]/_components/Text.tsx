import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { TextAlign, TextFormat, TextLayer } from '@/types/canvas';
import { cn, colorToCss } from '@/lib/utils';
import { useMutation } from '@/liveblocks.config';
import React, {
    CSSProperties,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { calculateFontSize } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';

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
        fill, // Цвет текста
        value = 'Text',
        fontName,
        fontSize,
        textAlign,
        textFormat,
    } = layer;

    const [currFontSize, setCurrFontSize] = useState(fontSize);
    const containerRef = useRef<HTMLDivElement>(null);

    const padding = 10; // Отступы от текста до края контейнера

    const updateValue = useMutation(({ storage }, newValue: string) => {
        const liveLayers = storage.get('layers');
        liveLayers.get(id)?.set('value', newValue);
    }, []);

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
    };

    useEffect(() => {
        setCurrFontSize(fontSize);
    }, [fontSize]);

    useEffect(() => {
        if (containerRef.current) {
            const contentWidth =
                containerRef.current.offsetWidth - padding * 2; // Учитываем горизонтальные отступы
            const contentHeight =
                containerRef.current.offsetHeight - padding * 2; // Учитываем вертикальные отступы

            const newFontSize = calculateFontSize(
                contentWidth,
                contentHeight,
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
            color: fill ? colorToCss(fill) : '#000',
            fontFamily: fontName,
            ...applyTextAlign,
            ...applyTextFormat,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            backgroundColor: 'transparent', // Всегда прозрачный фон
            padding: `${padding}px`, // Отступы от краёв контейнера
            boxSizing: 'border-box', // Учитываем отступы в общей ширине/высоте
        }),
        [currFontSize, fill, fontName, applyTextAlign, applyTextFormat],
    );

    const placeholderStyle = useMemo<CSSProperties>(
        () => ({
            ...textStyle,
            color: '#aaa',
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
            style={{ backgroundColor: 'transparent' }}
            className="shadow-md drop-shadow-xl"
        >
            <div
                ref={containerRef}
                className="h-full w-full flex flex-col items-center justify-center"
                style={{ backgroundColor: 'transparent' }}
            >
                <ContentEditable
                    html={value || 'Text'}
                    className={cn(
                        'h-full w-full flex flex-col justify-center outline-none',
                    )}
                    style={value ? textStyle : placeholderStyle}
                    onChange={handleContentChange}
                    data-placeholder="Text"
                />
            </div>
        </foreignObject>
    );
};
