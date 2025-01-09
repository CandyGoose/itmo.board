import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import {TextAlign, TextFormat, TextLayer} from "@/types/canvas";
import {cn, colorToCss} from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";
import React, {CSSProperties, useEffect, useMemo, useRef, useState} from "react";
import {font, doesTextFit, calculateFontSize } from "@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note";

interface TextProps {
    id:  string;
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

    const [currentWidth, setCurrentWidth] = useState(width);
    const [currFontSize, setCurrFontSize] = useState(fontSize);

    const containerRef = useRef<HTMLDivElement>(null);

    const PLACEHOLDER_COLOR = '#aaa';

    const outlineStyle = useMemo(
        () => (selectionColor ? `1px solid ${selectionColor}` : 'none'),
        [selectionColor],
    );

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
            color: fill ? colorToCss(fill) : PLACEHOLDER_COLOR,
            fontFamily: fontName,
            ...applyTextAlign,
            ...applyTextFormat,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            backgroundColor: "transparent",
        }),
        [fill, currFontSize, fontName, applyTextAlign, applyTextFormat],
    );

    const getPlaceholderStyle = (textStyle: CSSProperties): CSSProperties => ({
        ...textStyle,
        color: PLACEHOLDER_COLOR,
    });

    const placeholderStyle = useMemo<CSSProperties>(
        () => getPlaceholderStyle(textStyle),
        [textStyle],
    );

    useEffect(() => {
        setCurrFontSize(fontSize);
    }, [fontSize]);

    const updateValue = useMutation((
        { storage },
        newValue: string,
    )=> {
        const liveLayers = storage.get("layers");
        liveLayers.get(id)?.set("value", newValue);
    }, []);

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
    }

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
                value,
                fontSize,
                fontName,
            );

            if (newFontSize !== currFontSize) {
                setCurrFontSize(newFontSize);
            }
        }
    }, [width, height, currFontSize, fontSize, fontName, value]);


    const updateWidth = useMutation((
        { storage },
        newWidth: number,
    ) => {
        const liveLayers = storage.get("layers");
        liveLayers.get(id)?.set("width", newWidth);
    }, []);

    useEffect(() => {
        const calculateContainerWidth = (given_width: number, text: string, fontSize: number, fontName = 'Kalam') => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return given_width;

            if (doesTextFit(ctx, text, given_width, height, fontSize, fontName)) {
                return given_width;
            }

            const textWidth = ctx.measureText(text).width;
            return Math.max(textWidth, given_width);
        }

        const newWidth = calculateContainerWidth(currentWidth, value || "", currFontSize);

        setCurrentWidth(newWidth);
        if (containerRef.current) {
            const contentWidth = containerRef.current.offsetWidth;
            const contentHeight = containerRef.current.offsetHeight;

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
        updateWidth(newWidth);

        if (containerRef.current) {
            containerRef.current.style.width = `${newWidth}px`;
        }
    }, [height, value, currentWidth, updateWidth, currFontSize, fontSize, fontName]);

    return (
        <foreignObject
            x={x}
            y={y}
            width={currentWidth}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: outlineStyle
            }}
            className="p-3"
        >
            <div
                ref={containerRef}
                className="h-full w-full flex flex-col items-center justify-center"
                style={{
                    backgroundColor: "transparent",
                    width: `${currentWidth}px`,
                }}
            >
                <ContentEditable
                    html={value || "Text"}
                    onChange={handleContentChange}
                    className={cn(
                        "h-full w-full flex flex-col items-center justify-center text-center outline-none",
                        font.className
                    )}
                    style={value ? textStyle : placeholderStyle}
                    data-placeholder="Text"
                />
            </div>

        </foreignObject>
    )
}