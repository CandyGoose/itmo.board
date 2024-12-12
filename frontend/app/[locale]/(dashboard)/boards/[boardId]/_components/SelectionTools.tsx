'use client';

import React, { memo, useCallback, useState } from 'react';
import { Color, LayerType, Layer, TextAlign, TextFormat } from '@/types/canvas';
import { ColorPicker } from './ColorPicker';
import * as Toolbar from '@radix-ui/react-toolbar';
import { cn } from '@/lib/utils';
import { TransparentFillChecker } from './TransparentFillChecker';
import { LineWidthInput } from './LineWidthInput';
import { TwoValueInput } from './TwoValueInput';
import { FontPicker } from './FontPicker';
import { TextFormatPicker } from './TextFormatPicker';

interface SelectionToolsProps {
    selectedLayers: Layer[];
    lastUsedColor: Color;
    setLastUsedColor: (color: Color) => void;

    onLineWidthChange?: (width: number) => void;
    onFontChange?: (fontName: string) => void;
    onFontSizeChange?: (size: number) => void;
    onTextAlignChange?: (align: TextAlign) => void;
    onTextFormatChange?: (format: TextFormat[]) => void;
    onPositionChange?: (x: number, y: number) => void;
    onSizeChange?: (width: number, height: number) => void;
    onTransparentFillChange?: (transparent: boolean) => void;

    className?: string;
}

export const SelectionTools = memo(
    ({
        selectedLayers,
        lastUsedColor,
        setLastUsedColor,
        onLineWidthChange,
        onFontChange,
        onFontSizeChange,
        onTextFormatChange,
        onPositionChange,
        onSizeChange,
        onTransparentFillChange,
        className = '',
    }: SelectionToolsProps) => {
        const singleSelected = selectedLayers.length === 1;
        const noneSelected = selectedLayers.length === 0;
        const multiSelected = selectedLayers.length > 1;

        const selectedLayer = singleSelected ? selectedLayers[0] : null;

        const [lineWidth, setLineWidth] = useState(2);
        const [fontName, setFontName] = useState('Arial');
        const [fontSize, setFontSize] = useState(14);
        const [bold, setBold] = useState(false);
        const [italic, setItalic] = useState(false);
        const [strike, setStrike] = useState(false);
        const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
        // TODO: These values should be updated based on the selected layer

        const [x, setX] = useState(0);
        const [y, setY] = useState(0);
        const [w, setW] = useState(100);
        const [h, setH] = useState(100);

        const [transparentFill, setTransparentFill] = useState(false);

        // Determine which fields to show based on selection
        const isNote = singleSelected && selectedLayer?.type === LayerType.Note;
        const isPath = singleSelected && selectedLayer?.type === LayerType.Path;

        // Handle changes
        const handleColorChange = useCallback(
            (color: Color) => {
                setLastUsedColor(color);
            },
            [setLastUsedColor],
        );

        const handleTransparentChange = useCallback(
            (checked: boolean) => {
                setTransparentFill(checked);
                onTransparentFillChange?.(checked);
            },
            [onTransparentFillChange],
        );

        const handleLineWidthChange = useCallback(
            (val: string) => {
                const width = parseInt(val, 10);
                if (!isNaN(width)) {
                    setLineWidth(width);
                    onLineWidthChange?.(width);
                }
            },
            [onLineWidthChange],
        );

        const handleFontChange = useCallback(
            (font: string) => {
                setFontName(font);
                onFontChange?.(font);
            },
            [onFontChange],
        );

        const handleFontSizeChange = useCallback(
            (val: string) => {
                const size = parseInt(val, 10);
                if (!isNaN(size)) {
                    setFontSize(size);
                    onFontSizeChange?.(size);
                }
            },
            [onFontSizeChange],
        );

        const handleFormatChange = useCallback(
            (
                format: Partial<{
                    bold: boolean;
                    italic: boolean;
                    strike: boolean;
                    align: 'left' | 'center' | 'right';
                }>,
            ) => {
                onTextFormatChange?.({
                    bold: format.bold ?? bold,
                    italic: format.italic ?? italic,
                    strike: format.strike ?? strike,
                    align: format.align ?? align,
                });
            },
            [onTextFormatChange, bold, italic, strike, align],
        );

        const handlePositionChange = useCallback(
            (coordX: string, coordY: string) => {
                const newX = parseFloat(coordX);
                const newY = parseFloat(coordY);
                if (!isNaN(newX) && !isNaN(newY)) {
                    setX(newX);
                    setY(newY);
                    onPositionChange?.(newX, newY);
                }
            },
            [onPositionChange],
        );

        const handleSizeChange = useCallback(
            (widthVal: string, heightVal: string) => {
                const newW = parseFloat(widthVal);
                const newH = parseFloat(heightVal);
                if (!isNaN(newW) && !isNaN(newH)) {
                    setW(newW);
                    setH(newH);
                    onSizeChange?.(newW, newH);
                }
            },
            [onSizeChange],
        );

        // If multiple selected, show nothing
        if (multiSelected) {
            return null;
        }

        return (
            <Toolbar.Root
                data-testid="selection-tools-container"
                className={cn(
                    `absolute p-3 rounded-xl bg-white shadow-sm border flex select-none flex-col ${className}`,
                )}
                style={{ right: '8px', width: '200px' }}
                aria-label="Formatting options"
            >
                {/* Colors and fill */}
                {(noneSelected || singleSelected) && (
                    <>
                        <div className="mb-2">
                            <ColorPicker onChangeAction={handleColorChange} />
                            {!isPath && (
                                <TransparentFillChecker
                                    transparentFill={transparentFill}
                                    onTransparentFillChange={
                                        handleTransparentChange
                                    }
                                />
                            )}
                        </div>
                        <Toolbar.Separator className="my-2 h-px bg-mauve6" />
                    </>
                )}

                {/* Line width */}
                {(noneSelected || singleSelected) && (
                    <>
                        <LineWidthInput
                            lineWidth={lineWidth}
                            onLineWidthChange={handleLineWidthChange}
                        />
                        <Toolbar.Separator className="my-2 h-px bg-mauve6" />
                    </>
                )}

                {/* Coordinates and Size */}
                {singleSelected && (
                    <>
                        <TwoValueInput
                            label="X,Y Position:"
                            value1={x}
                            value2={y}
                            onChange1={(val) =>
                                handlePositionChange(val, y.toString())
                            }
                            onChange2={(val) =>
                                handlePositionChange(x.toString(), val)
                            }
                        />
                        <TwoValueInput
                            label="Width,Height:"
                            value1={w}
                            value2={h}
                            onChange1={(val) =>
                                handleSizeChange(val, h.toString())
                            }
                            onChange2={(val) =>
                                handleSizeChange(w.toString(), val)
                            }
                        />
                        {isNote && (
                            <Toolbar.Separator className="my-2 h-px bg-mauve6" />
                        )}
                    </>
                )}

                {/* Font and Text styling (only if single note selected) */}
                {isNote && (
                    <>
                        <FontPicker
                            fontName={fontName}
                            onFontChange={handleFontChange}
                            fontSize={fontSize}
                            onFontSizeChange={handleFontSizeChange}
                        />
                        <Toolbar.Separator className="my-2 h-px bg-mauve6" />

                        <TextFormatPicker
                            bold={bold}
                            italic={italic}
                            strike={strike}
                            align={align}
                            onFormatChange={handleFormatChange}
                        />
                    </>
                )}
            </Toolbar.Root>
        );
    },
);

SelectionTools.displayName = 'SelectionTools';
