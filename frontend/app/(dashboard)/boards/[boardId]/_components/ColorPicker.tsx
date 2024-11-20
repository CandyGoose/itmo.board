'use client';

import React, { useRef, useState } from 'react';
import { colorToCss, parseColor } from '@/lib/utils';
import { Color } from '@/types/canvas';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ColorPickerProps {
    onChange: (color: Color) => void;
}

export const ColorPicker = ({ onChange }: ColorPickerProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputColor, setInputColor] = useState('#2563eb');

    const modernColors = [
        { r: 0, g: 188, b: 212 }, // Cyan
        { r: 255, g: 145, b: 77 }, // Orange
        { r: 0, g: 150, b: 136 }, // Teal
        { r: 33, g: 150, b: 243 }, // Blue
        { r: 244, g: 67, b: 54 }, // Red
        { r: 0, g: 0, b: 0 }, // Black
        { r: 255, g: 255, b: 255 }, // White
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputColor(e.target.value);
        onChange(parseColor(e.target.value) as Color);
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="flex flex-wrap gap-2 items-center max-w-[164px] pr-2 mr-2 border-r border-neutral-200">
            {modernColors.map((color, index) => (
                <ColorButton key={index} color={color} onClick={onChange} />
            ))}
            <button
                className="p-1 h-8 w-8 flex items-center justify-center bg-gradient-to-r from-[#879AF2] via-[#D3208B] to-[#FDA000] border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                onClick={handleButtonClick}
                title="Choose your color"
            >
                <Input
                    ref={inputRef}
                    type="color"
                    className="absolute -z-10 opacity-0 cursor-pointer"
                    value={inputColor}
                    onChange={handleInputChange}
                />
                <Plus className="h-5 w-5 text-white font-bold" />
            </button>
        </div>
    );
};

interface ColorButtonProps {
    onClick: (color: Color) => void;
    color: Color;
}

const ColorButton = ({ onClick, color }: ColorButtonProps) => {
    return (
        <button
            className="h-8 w-8 items-center flex justify-center hover:opacity-75 transition"
            onClick={() => onClick(color)}
        >
            <div
                className="h-8 w-8 rounded-md border border-neutral-300"
                style={{ background: colorToCss(color) }}
            />
        </button>
    );
};
