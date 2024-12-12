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

interface TextFormatPickerProps {
    bold: boolean;
    italic: boolean;
    strike: boolean;
    align: string;
    onFormatChange: (format: {
        bold?: boolean;
        italic?: boolean;
        strike?: boolean;
        align?: string;
    }) => void;
}

const textFormats = [
    { value: 'bold', icon: <FontBoldIcon />, ariaLabel: 'Bold' },
    { value: 'italic', icon: <FontItalicIcon />, ariaLabel: 'Italic' },
    {
        value: 'strike',
        icon: <StrikethroughIcon />,
        ariaLabel: 'Strike through',
    },
];

const textAligns = [
    { value: 'left', icon: <TextAlignLeftIcon />, ariaLabel: 'Left aligned' },
    {
        value: 'center',
        icon: <TextAlignCenterIcon />,
        ariaLabel: 'Center aligned',
    },
    {
        value: 'right',
        icon: <TextAlignRightIcon />,
        ariaLabel: 'Right aligned',
    },
];

const ToolbarToggleItem = ({
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
        className="ml-0.5 inline-flex h-[25px] items-center justify-center rounded bg-white px-[5px] text-[13px] hover:bg-violet3"
        value={value}
        aria-label={ariaLabel}
        data-state={selected ? 'active' : 'inactive'}
        onClick={() => onChange(value)}
    >
        {icon}
    </Toolbar.ToggleItem>
);

export const TextFormatPicker: React.FC<TextFormatPickerProps> = memo(
    ({ bold, italic, strike, align, onFormatChange }) => {
        const handleFormatChange = (values: string[]) => {
            onFormatChange({
                bold: values.includes('bold'),
                italic: values.includes('italic'),
                strike: values.includes('strike'),
            });
        };

        const handleAlignChange = (value: string | null) => {
            if (value) {
                onFormatChange({ align: value });
            }
        };

        return (
            <div className="flex flex-wrap">
                {/* Formatting Group */}
                <Toolbar.ToggleGroup
                    type="multiple"
                    aria-label="Text formatting"
                    className="flex mb-2"
                    onValueChange={handleFormatChange}
                    value={
                        [
                            bold && 'bold',
                            italic && 'italic',
                            strike && 'strike',
                        ].filter(Boolean) as string[]
                    }
                >
                    {textFormats.map(({ value, icon, ariaLabel }) => (
                        <ToolbarToggleItem
                            key={value}
                            value={value}
                            icon={icon}
                            ariaLabel={ariaLabel}
                            selected={
                                value === 'bold'
                                    ? bold
                                    : value === 'italic'
                                    ? italic
                                    : strike
                            }
                            onChange={() => handleFormatChange([value])}
                        />
                    ))}
                </Toolbar.ToggleGroup>

                {/* Alignment Group */}
                <Toolbar.ToggleGroup
                    type="single"
                    aria-label="Text alignment"
                    className="flex"
                    onValueChange={handleAlignChange}
                    value={align}
                >
                    {textAligns.map(({ value, icon, ariaLabel }) => (
                        <ToolbarToggleItem
                            key={value}
                            value={value}
                            icon={icon}
                            ariaLabel={ariaLabel}
                            selected={align === value}
                            onChange={handleAlignChange}
                        />
                    ))}
                </Toolbar.ToggleGroup>
            </div>
        );
    },
);

TextFormatPicker.displayName = 'TextFormatPicker';
