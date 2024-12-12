'use client';

import React, { memo, useCallback, useState } from 'react';
import { Color, LayerType, Layer } from '@/types/canvas';
import { ColorPicker } from './ColorPicker';
import * as Toolbar from "@radix-ui/react-toolbar";
import {
    FontBoldIcon,
    FontItalicIcon,
    StrikethroughIcon,
    TextAlignCenterIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
} from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { TransparentFillChecker } from './TransparentFillChecker';

interface SelectionToolsProps {
    selectedLayers: Layer[];
    lastUsedColor: Color;
    setLastUsedColor: (color: Color) => void;

    onLineWidthChange?: (width: number) => void;
    onFontChange?: (fontName: string) => void;
    onFontSizeChange?: (size: number) => void;
    onTextFormatChange?: (format: { bold?: boolean; italic?: boolean; strike?: boolean; align?: 'left' | 'center' | 'right' }) => void;
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
        const [align, setAlign] = useState<'left'|'center'|'right'>('left');

        const [x, setX] = useState(0);
        const [y, setY] = useState(0);
        const [w, setW] = useState(100);
        const [h, setH] = useState(100);

        const [transparentFill, setTransparentFill] = useState(false);

        // Determine which fields to show based on selection
        const isNote = singleSelected && selectedLayer?.type === LayerType.Note;
        const isPath = singleSelected && selectedLayer?.type === LayerType.Path;

        // Handle changes
        const handleColorChange = useCallback((color: Color) => {
            setLastUsedColor(color);
        }, [setLastUsedColor]);

        const handleTransparentChange = useCallback((checked: boolean) => {
            setTransparentFill(checked);
            onTransparentFillChange?.(checked);
        }, [onTransparentFillChange, lastUsedColor]);

        const handleLineWidthChange = useCallback((val: string) => {
            const width = parseInt(val, 10);
            if (!isNaN(width)) {
                setLineWidth(width);
                onLineWidthChange?.(width);
            }
        }, [onLineWidthChange]);

        const handleFontChange = useCallback((font: string) => {
            setFontName(font);
            onFontChange?.(font);
        }, [onFontChange]);

        const handleFontSizeChange = useCallback((val: string) => {
            const size = parseInt(val, 10);
            if (!isNaN(size)) {
                setFontSize(size);
                onFontSizeChange?.(size);
            }
        }, [onFontSizeChange]);

        const handleFormatChange = useCallback((format: Partial<{bold: boolean; italic: boolean; strike: boolean; align: 'left'|'center'|'right'}>) => {
            onTextFormatChange?.({
                bold: format.bold ?? bold,
                italic: format.italic ?? italic,
                strike: format.strike ?? strike,
                align: format.align ?? align
            });
        }, [onTextFormatChange, bold, italic, strike, align]);

        const handlePositionChange = useCallback((coordX: string, coordY: string) => {
            const newX = parseFloat(coordX);
            const newY = parseFloat(coordY);
            if (!isNaN(newX) && !isNaN(newY)) {
                setX(newX);
                setY(newY);
                onPositionChange?.(newX, newY);
            }
        }, [onPositionChange]);

        const handleSizeChange = useCallback((widthVal: string, heightVal: string) => {
            const newW = parseFloat(widthVal);
            const newH = parseFloat(heightVal);
            if (!isNaN(newW) && !isNaN(newH)) {
                setW(newW);
                setH(newH);
                onSizeChange?.(newW, newH);
            }
        }, [onSizeChange]);

        // If multiple selected, show nothing
        if (multiSelected) {
            return null;
        }

        return (
            <Toolbar.Root
                data-testid="selection-tools-container"
                className={cn(`absolute p-3 rounded-xl bg-white shadow-sm border flex select-none flex-col ${className}`)}
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
                                        onTransparentFillChange={handleTransparentChange}
                                    />
                                )}
                            </div>
                            <Toolbar.Separator className="my-2 h-px bg-mauve6" />
                        </>
                    )}

                    {/* Line width */}
                    {(noneSelected || singleSelected) && (
                        <>
                            <div className="flex flex-col mb-2">
                                <label className="text-sm mb-1">Line Width</label> {/*TODO: Add translation*/}
                                <input
                                    type="number"
                                    value={lineWidth}
                                    onChange={(e) => handleLineWidthChange(e.target.value)}
                                    className="border rounded p-1 text-sm"
                                    min={1}
                                />
                                <div className="mt-1 flex items-center">
                                    <div
                                        className="bg-black"
                                        style={{ width: '50px', height: `${lineWidth}px`}}
                                    />
                                </div>
                            </div>
                            <Toolbar.Separator className="my-2 h-px bg-mauve6" />
                        </>
                    )}

                    {/* Coordinates and Size */}
                    {(noneSelected || singleSelected) && (
                        <>
                            <div className="mb-2">
                                <label className="text-sm">X,Y Position:</label>
                                <div className="flex gap-1">
                                    <input
                                        type="number"
                                        value={x}
                                        onChange={(e) => handlePositionChange(e.target.value, y.toString())}
                                        className="border rounded p-1 text-sm w-1/2"
                                    />
                                    <input
                                        type="number"
                                        value={y}
                                        onChange={(e) => handlePositionChange(x.toString(), e.target.value)}
                                        className="border rounded p-1 text-sm w-1/2"
                                    />
                                </div>
                            </div>
                            <div className="mb-2">
                                <label className="text-sm">Width,Height:</label>
                                <div className="flex gap-1">
                                    <input
                                        type="number"
                                        value={w}
                                        onChange={(e) => handleSizeChange(e.target.value, h.toString())}
                                        className="border rounded p-1 text-sm w-1/2"
                                    />
                                    <input
                                        type="number"
                                        value={h}
                                        onChange={(e) => handleSizeChange(w.toString(), e.target.value)}
                                        className="border rounded p-1 text-sm w-1/2"
                                    />
                                </div>
                            </div>
                            {isNote && <Toolbar.Separator className="my-2 h-px bg-mauve6" />}
                        </>
                    )}

                    {/* Font and Text styling (only if single note selected) */}
                    {isNote && (
                        <>
                            {/* Font selection */}
                            <div className="mb-2">
                                <label className="text-sm mb-1 block">Font</label>
                                <select
                                    value={fontName}
                                    onChange={(e) => handleFontChange(e.target.value)}
                                    className="border rounded p-1 text-sm w-full"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    {/* Add more fonts as needed */}
                                </select>
                            </div>

                            {/* Font size */}
                            <div className="mb-2">
                                <label className="text-sm mb-1 block">Font Size</label>
                                <input
                                    type="number"
                                    value={fontSize}
                                    onChange={(e) => handleFontSizeChange(e.target.value)}
                                    className="border rounded p-1 text-sm w-full"
                                    min={1}
                                />
                            </div>

                            <Toolbar.Separator className="my-2 h-px bg-mauve6" />

                            {/* Text formatting */}
                            <Toolbar.ToggleGroup
                                type="multiple"
                                aria-label="Text formatting"
                                className="flex mb-2"
                                onValueChange={(values) => {
                                    setBold(values.includes('bold'));
                                    setItalic(values.includes('italic'));
                                    setStrike(values.includes('strike'));
                                    handleFormatChange({
                                        bold: values.includes('bold'),
                                        italic: values.includes('italic'),
                                        strike: values.includes('strike')
                                    });
                                }}
                                value={[
                                    bold ? 'bold' : '',
                                    italic ? 'italic' : '',
                                    strike ? 'strike' : ''
                                ].filter(Boolean)}
                            >
                                <Toolbar.ToggleItem
                                    className="ml-0.5 inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
                                    value="bold"
                                    aria-label="Bold"
                                >
                                    <FontBoldIcon />
                                </Toolbar.ToggleItem>
                                <Toolbar.ToggleItem
                                    className="ml-0.5 inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
                                    value="italic"
                                    aria-label="Italic"
                                >
                                    <FontItalicIcon />
                                </Toolbar.ToggleItem>
                                <Toolbar.ToggleItem
                                    className="ml-0.5 inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
                                    value="strike"
                                    aria-label="Strike through"
                                >
                                    <StrikethroughIcon />
                                </Toolbar.ToggleItem>
                            </Toolbar.ToggleGroup>

                            <Toolbar.ToggleGroup
                                type="single"
                                aria-label="Text alignment"
                                className="flex"
                                value={align}
                                onValueChange={(val) => {
                                    if (val) {
                                        setAlign(val as 'left'|'center'|'right');
                                        handleFormatChange({ align: val as 'left'|'center'|'right' });
                                    }
                                }}
                            >
                                <Toolbar.ToggleItem
                                    className="ml-0.5 inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
                                    value="left"
                                    aria-label="Left aligned"
                                >
                                    <TextAlignLeftIcon />
                                </Toolbar.ToggleItem>
                                <Toolbar.ToggleItem
                                    className="ml-0.5 inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
                                    value="center"
                                    aria-label="Center aligned"
                                >
                                    <TextAlignCenterIcon />
                                </Toolbar.ToggleItem>
                                <Toolbar.ToggleItem
                                    className="ml-0.5 inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
                                    value="right"
                                    aria-label="Right aligned"
                                >
                                    <TextAlignRightIcon />
                                </Toolbar.ToggleItem>
                            </Toolbar.ToggleGroup>
                        </>
                    )}
                </Toolbar.Root>
        );
    },
);

SelectionTools.displayName = 'SelectionTools';
