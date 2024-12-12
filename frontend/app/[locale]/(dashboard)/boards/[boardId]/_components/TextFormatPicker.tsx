import React, { memo } from 'react';
import {
    FontBoldIcon,
    FontItalicIcon,
    StrikethroughIcon,
    TextAlignCenterIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
} from '@radix-ui/react-icons';
import * as Toolbar from "@radix-ui/react-toolbar";

interface TextFormatPickerProps {
    bold: boolean;
    italic: boolean;
    strike: boolean;
    align: 'left' | 'center' | 'right';
    onFormatChange: (format: { bold?: boolean; italic?: boolean; strike?: boolean; align?: 'left' | 'center' | 'right' }) => void;
}

export const TextFormatPicker: React.FC<TextFormatPickerProps> = memo(({ bold, italic, strike, align, onFormatChange }) => {
    return (
        <div className="flex flex-wrap">
            <Toolbar.ToggleGroup
                type="multiple"
                aria-label="Text formatting"
                className="flex mb-2"
                onValueChange={(values) => {
                    onFormatChange({
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
                        onFormatChange({ align: val as 'left' | 'center' | 'right' });
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
        </div>
    );
});

TextFormatPicker.displayName = 'TextFormatPicker';