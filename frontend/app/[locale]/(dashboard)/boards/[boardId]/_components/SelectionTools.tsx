'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Color, Layer, LayerType, TextAlign, TextFormat } from '@/types/canvas';
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
    onColorChange: (color: Color) => void;
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
        onColorChange,
        onLineWidthChange,
        onFontChange,
        onFontSizeChange,
        onTextAlignChange,
        onTextFormatChange,
        onPositionChange,
        onSizeChange,
        onTransparentFillChange,
        className = '',
    }: SelectionToolsProps) => {
        const singleSelected = selectedLayers.length === 1;
        const multiSelected = selectedLayers.length > 1;

        const selectedLayer = singleSelected ? selectedLayers[0] : null;

        // State variables
        const [lineWidth, setLineWidth] = useState<number>(2);
        const [fontName, setFontName] = useState<string>('Arial');
        const [fontSize, setFontSize] = useState<number>(14);
        const [format, setFormat] = useState<TextFormat[]>([]);
        const [align, setAlign] = useState<TextAlign>(TextAlign.Left);
        const [x, setX] = useState<number>(0);
        const [y, setY] = useState<number>(0);
        const [w, setW] = useState<number>(100);
        const [h, setH] = useState<number>(100);
        const [transparentFill, setTransparentFill] = useState<boolean>(false);

        useEffect(() => {
            if (selectedLayer) {
                setLineWidth(selectedLayer.lineWidth ?? 2);
                if (selectedLayer.type === LayerType.Note) {
                    setFontName(selectedLayer.fontName ?? 'Arial');
                    setFontSize(selectedLayer.fontSize ?? 14);
                    setFormat(selectedLayer.textFormat ?? []);
                    setAlign(selectedLayer.textAlign ?? TextAlign.Left);
                }
                if (selectedLayer.x && selectedLayer.y) {
                    setX(selectedLayer.x);
                    setY(selectedLayer.y);
                }
                if (selectedLayer.width && selectedLayer.height) {
                    setW(selectedLayer.width);
                    setH(selectedLayer.height);
                }
                setTransparentFill(!selectedLayer.fill);
            } else {
                // TODO: Set to global values from canvas instead of defaults
                setLineWidth(2);
                setFontName('Arial');
                setFontSize(14);
                setFormat([]);
                setAlign(TextAlign.Left);
                setX(0);
                setY(0);
                setW(100);
                setH(100);
                setTransparentFill(false);
            }
        }, [selectedLayer]);

        const isNote = singleSelected && selectedLayer?.type === LayerType.Note;
        const isPath = singleSelected && selectedLayer?.type === LayerType.Path;

        // Handle changes
        const handleColorChange = useCallback(
            (color: Color) => {
                onColorChange(color);
                // Optionally, update the selected layer's color here
                // Example:
                // if (selectedLayer) {
                //     updateLayerColor(selectedLayer.id, color);
                // }
            },
            [onColorChange],
        );

        const handleTransparentChange = useCallback(
            (checked: boolean) => {
                setTransparentFill(checked);
                onTransparentFillChange?.(checked);
                // Optionally, update the selected layer's transparency here
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
            (textFormatting: {
                textFormat?: TextFormat[];
                textAlign?: TextAlign;
            }) => {
                const newFormat = textFormatting.textFormat ?? format;
                const newAlign = textFormatting.textAlign ?? align;

                setFormat(newFormat);
                setAlign(newAlign);

                onTextFormatChange?.(newFormat);
                onTextAlignChange?.(newAlign);
            },
            [format, align, onTextFormatChange, onTextAlignChange],
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
                {(selectedLayer || !selectedLayer) && (
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
                {(selectedLayer || !selectedLayer) && (
                    <>
                        <LineWidthInput
                            lineWidth={lineWidth}
                            onLineWidthChange={handleLineWidthChange}
                        />
                        <Toolbar.Separator className="my-2 h-px bg-mauve6" />
                    </>
                )}

                {/* Coordinates and Size */}
                {selectedLayer && (
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
                            textFormat={format}
                            textAlign={align}
                            onFormatChange={handleFormatChange}
                        />
                    </>
                )}
            </Toolbar.Root>
        );
    },
);

SelectionTools.displayName = 'SelectionTools';
