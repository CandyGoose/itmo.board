'use client';

import React, { memo, useCallback } from 'react';
import { Color, Layer, LayerType, TextAlign, TextFormat } from '@/types/canvas';
import { ColorPicker } from './ColorPicker';
import * as Toolbar from '@radix-ui/react-toolbar';
import { cn } from '@/lib/utils';
import { TransparentFillChecker } from './TransparentFillChecker';
import { LineWidthInput } from './LineWidthInput';
import { TwoValueInput } from './TwoValueInput';
import { FontPicker } from './FontPicker';
import { TextFormatPicker } from './TextFormatPicker';
import { useTranslations } from 'next-intl';

export interface SelectionToolsProps {
    selectedLayers: Layer[];
    onColorChange: (color: Color) => void;
    lineWidth: number;
    onLineWidthChange: (width: number) => void;
    fontName: string;
    onFontChange: (fontName: string) => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    fontAlign: TextAlign;
    onTextAlignChange: (align: TextAlign) => void;
    fontFormat: TextFormat[];
    onTextFormatChange: (format: TextFormat[]) => void;
    onPositionChange: (x: number, y: number) => void;
    onSizeChange: (width: number, height: number) => void;
    transparentFill: boolean;
    onTransparentFillChange: (transparent: boolean) => void;
    className?: string;
}

export const SelectionTools = memo(
    ({
        selectedLayers,
        onColorChange,
        lineWidth,
        onLineWidthChange,
        fontName,
        onFontChange,
        fontSize,
        onFontSizeChange,
        fontAlign,
        onTextAlignChange,
        fontFormat,
        onTextFormatChange,
        onPositionChange,
        onSizeChange,
        transparentFill,
        onTransparentFillChange,
        className = '',
    }: SelectionToolsProps) => {
        const t = useTranslations('tools');
        const singleSelected = selectedLayers.length === 1;
        const multiSelected = selectedLayers.length > 1;

        const selectedLayer = singleSelected ? selectedLayers[0] : null;

        const isNote = singleSelected && selectedLayer?.type === LayerType.Note;
        const isPath = singleSelected && selectedLayer?.type === LayerType.Path;

        const handleFormatChange = useCallback(
            (format: { textFormat?: TextFormat[]; textAlign?: TextAlign }) => {
                onTextFormatChange(format.textFormat ?? fontFormat);
                onTextAlignChange(format.textAlign ?? fontAlign);
            },
            [onTextFormatChange, fontFormat, onTextAlignChange, fontAlign],
        );

        // If multiple selected, show nothing
        if (multiSelected) {
            return null;
        }

        return (
            <Toolbar.Root
                data-testid="selection-tools-container"
                className={cn(
                    'absolute p-3 rounded-xl bg-white shadow-md border flex select-none flex-col',
                    className,
                )}
                style={{ right: '8px', width: '200px' }}
                aria-label="Formatting options"
            >
                {/* Colors and fill */}
                <div className="mb-2">
                    <ColorPicker onChangeAction={onColorChange} />
                    {!isPath && (
                        <TransparentFillChecker
                            transparentFill={
                                selectedLayer
                                    ? selectedLayer.fill === undefined
                                    : transparentFill
                            }
                            onTransparentFillChange={onTransparentFillChange}
                        />
                    )}
                </div>

                {/* Line width */}
                <div className="mb-2">
                    <LineWidthInput
                        lineWidth={selectedLayer?.lineWidth ?? lineWidth}
                        onLineWidthChange={onLineWidthChange}
                    />
                </div>

                {/* Coordinates and Size */}
                {selectedLayer && (
                    <>
                        <TwoValueInput
                            label1="X"
                            label2="Y"
                            value1={selectedLayer.x}
                            value2={selectedLayer.y}
                            onChange1={(val) =>
                                onPositionChange(val, selectedLayer.y)
                            }
                            onChange2={(val) =>
                                onPositionChange(selectedLayer.x, val)
                            }
                            className="mb-1"
                        />
                        <TwoValueInput
                            label1={t('width')}
                            label2={t('height')}
                            value1={selectedLayer.width}
                            value2={selectedLayer.height}
                            onChange1={(val) =>
                                onSizeChange(val, selectedLayer.height)
                            }
                            onChange2={(val) =>
                                onSizeChange(selectedLayer.width, val)
                            }
                            className="mb-2"
                        />
                    </>
                )}

                {/* Font and Text styling (only if single note selected) */}
                {isNote && (
                    <>
                        <FontPicker
                            fontName={
                                selectedLayer.fontName ?? fontName ?? 'Kalam'
                            }
                            onFontChange={onFontChange}
                            fontSize={selectedLayer.fontSize ?? fontSize ?? 14}
                            onFontSizeChange={onFontSizeChange}
                        />
                        <TextFormatPicker
                            textFormat={
                                selectedLayer?.textFormat ??
                                fontFormat ?? [TextFormat.None]
                            }
                            textAlign={
                                selectedLayer?.textAlign ??
                                fontAlign ??
                                TextAlign.Center
                            }
                            onFormatChange={handleFormatChange}
                        />
                    </>
                )}
            </Toolbar.Root>
        );
    },
);

SelectionTools.displayName = 'SelectionTools';
