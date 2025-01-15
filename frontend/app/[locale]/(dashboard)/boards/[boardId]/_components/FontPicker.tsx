import React, { memo, useState } from 'react';
import {
    MAX_FONT_SIZE,
    MIN_FONT_SIZE,
    doesTextFit,
} from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';
import { useTranslations } from 'next-intl';
import { Fonts } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Fonts';

interface FontPickerProps {
    fontName: string;
    onFontChange: (fontName: string) => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    noteWidth: number;
    noteHeight: number;
    noteText: string;
}

export const FontPicker: React.FC<FontPickerProps> = memo(
    ({
         fontName,
         onFontChange,
         fontSize,
         onFontSizeChange,
         noteWidth,
         noteHeight,
         noteText,
     }) => {
        const t = useTranslations('tools');
        const [inputValue, setInputValue] = useState<string>(
            fontSize.toString(),
        );

        const applyFontSize = (value: string) => {
            let numericValue = parseInt(value, 10) || MIN_FONT_SIZE;

            // Ограничиваем значение диапазоном
            numericValue = Math.max(
                MIN_FONT_SIZE,
                Math.min(MAX_FONT_SIZE, numericValue),
            );

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            }

            const textFits = doesTextFit(
                ctx,
                noteText,
                noteWidth,
                noteHeight,
                numericValue,
                fontName,
            );

            if (textFits) {
                onFontSizeChange(numericValue);
            } else {
                setInputValue(fontSize.toString());
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const invalidKeys = ['e', 'E', '+', '-', '.', ','];
            if (
                invalidKeys.includes(e.key) ||
                (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Enter')
            ) {
                e.preventDefault();
            }

            if (e.key === 'Enter') {
                applyFontSize(inputValue);
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let sanitizedValue = e.target.value.replace(/[^\d]/g, '');
            const numericValue = parseInt(sanitizedValue, 10);

            // Ограничиваем вводимое значение до 72
            if (numericValue > MAX_FONT_SIZE) {
                sanitizedValue = MAX_FONT_SIZE.toString();
            }

            setInputValue(sanitizedValue);
        };

        return (
            <>
                <div className="mb-1">
                    <label
                        className="text-sm mb-1 block text-[var(--text-color)]"
                        htmlFor="font-picker"
                    >
                        {t('font')}
                    </label>
                    <select
                        id="font-picker"
                        value={fontName}
                        onChange={(e) => onFontChange(e.target.value)}
                        className="border rounded p-1 text-sm w-full
                                   bg-[var(--background-color)]
                                   text-[var(--text-color)]
                                   border-[var(--border)]"
                    >
                        {Fonts.map((font) => (
                            <option
                                key={font}
                                value={font}
                                style={{ fontFamily: font }}
                            >
                                {font}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Font size */}
                <div className="mb-2">
                    <label
                        className="text-sm mb-1 block text-[var(--text-color)]"
                        htmlFor="font-size-input"
                    >
                        {t('fontSize')}
                    </label>
                    <input
                        id="font-size-input"
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={() => applyFontSize(inputValue)}
                        className="border rounded p-1 text-sm w-full
                                   bg-[var(--background-color)]
                                   text-[var(--text-color)]
                                   border-[var(--border)]"
                        min={MIN_FONT_SIZE}
                        max={MAX_FONT_SIZE}
                    />
                </div>
            </>
        );
    },
);

FontPicker.displayName = 'FontPicker';
