import React, { memo } from 'react';
import {
    FontBoldIcon,
    FontItalicIcon,
    StrikethroughIcon,
    TextAlignCenterIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
} from '@radix-ui/react-icons';
import * as Toolbar from '@radix-ui/react-toolbar';
import { TextAlign, TextFormat } from '@/types/canvas';

interface TextFormatPickerProps {
    textFormat: TextFormat[];
    textAlign: TextAlign;
    onFormatChange: (textFormatting: {
        textFormat?: TextFormat[];
        textAlign?: TextAlign;
    }) => void;
}

const textFormats = [
    {
        value: TextFormat.Bold,
        icon: <FontBoldIcon />,
        ariaLabel: 'Bold',
    },
    {
        value: TextFormat.Italic,
        icon: <FontItalicIcon />,
        ariaLabel: 'Italic',
    },
    {
        value: TextFormat.Strike,
        icon: <StrikethroughIcon />,
        ariaLabel: 'Strike Through',
    },
];

const textAligns = [
    {
        value: TextAlign.Left,
        icon: <TextAlignLeftIcon />,
        ariaLabel: 'Left Aligned',
    },
    {
        value: TextAlign.Center,
        icon: <TextAlignCenterIcon />,
        ariaLabel: 'Center Aligned',
    },
    {
        value: TextAlign.Right,
        icon: <TextAlignRightIcon />,
        ariaLabel: 'Right Aligned',
    },
];

const ToolbarToggleItem = memo(
    ({
        value,
        icon,
        ariaLabel,
        selected,
        onChange,
    }: {
        value: string;
        icon: React.ReactNode;
        ariaLabel: string;
        selected: boolean;
        onChange: (value: string) => void;
    }) => (
        <Toolbar.ToggleItem
            className="inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
            value={value}
            aria-label={ariaLabel}
            data-state={selected ? 'on' : 'off'}
            onClick={() => onChange(value)}
        >
            {icon}
        </Toolbar.ToggleItem>
    ),
);
ToolbarToggleItem.displayName = 'ToolbarToggleItem';

export const TextFormatPicker: React.FC<TextFormatPickerProps> = memo(
    ({ textFormat, textAlign, onFormatChange }) => {
        const handleFormatChange = (values: string[]) => {
            const selectedFormats = values.map((v) => Number(v) as TextFormat);
            onFormatChange({ textFormat: selectedFormats, textAlign });
        };

        const handleAlignChange = (value: string | null) => {
            if (value !== null) {
                const newAlign = Number(value) as TextAlign;
                onFormatChange({ textFormat, textAlign: newAlign });
            }
        };

        return (
            <div className="flex">
                {/* Text Formatting (multiple select) */}
                <Toolbar.ToggleGroup
                    type="multiple"
                    aria-label="Text formatting"
                    className="flex"
                    onValueChange={handleFormatChange}
                    value={textFormat.map((f) => f.toString())}
                >
                    {textFormats.map(({ value, icon, ariaLabel }) => (
                        <ToolbarToggleItem
                            key={value}
                            value={value.toString()}
                            icon={icon}
                            ariaLabel={ariaLabel}
                            selected={textFormat.includes(value)}
                            onChange={(val) => {
                                const currentSelected = new Set(textFormat);
                                const toggledValue = Number(val) as TextFormat;
                                if (currentSelected.has(toggledValue)) {
                                    currentSelected.delete(toggledValue);
                                } else {
                                    currentSelected.add(toggledValue);
                                }
                                onFormatChange({
                                    textFormat: Array.from(currentSelected),
                                    textAlign,
                                });
                            }}
                        />
                    ))}
                </Toolbar.ToggleGroup>

                {/* Text Alignment (single select) */}
                <Toolbar.ToggleGroup
                    type="single"
                    aria-label="Text alignment"
                    className="flex ml-2"
                    onValueChange={handleAlignChange}
                    value={textAlign.toString()}
                >
                    {textAligns.map(({ value, icon, ariaLabel }) => (
                        <ToolbarToggleItem
                            key={value}
                            value={value.toString()}
                            icon={icon}
                            ariaLabel={ariaLabel}
                            selected={textAlign === value}
                            onChange={(val) => handleAlignChange(val)}
                        />
                    ))}
                </Toolbar.ToggleGroup>
            </div>
        );
    },
);

TextFormatPicker.displayName = 'TextFormatPicker';
