import React, { memo } from 'react';
import {
    MAX_FONT_SIZE,
    MIN_FONT_SIZE,
} from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';
import { useTranslations } from 'next-intl';
import { Kalam } from 'next/font/google';

const font = Kalam({
    subsets: ['latin'],
    weight: ['400'],
});

interface FontPickerProps {
    fontName: string;
    onFontChange: (fontName: string) => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
}

export const FontPicker: React.FC<FontPickerProps> = memo(
    ({ fontName, onFontChange, fontSize, onFontSizeChange }) => {
        const t = useTranslations('tools');

        const handleFontSizeBlur = (value: string) => {
            const numericValue = Math.max(
                MIN_FONT_SIZE,
                Math.min(MAX_FONT_SIZE, parseInt(value, 10) || MIN_FONT_SIZE),
            );
            onFontSizeChange(numericValue);
        };

        return (
            <>
                <div className="mb-1">
                    <label className="text-sm mb-1 block text-[var(--text-color)]" htmlFor="font-picker">
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
                        <option value="Kalam" className={font.className}>
                            Kalam
                        </option>
                        <option value="Arial" style={{ fontFamily: 'Arial' }}>
                            Arial
                        </option>
                        <option
                            value="Times New Roman"
                            style={{ fontFamily: 'Times New Roman' }}
                        >
                            Times New Roman
                        </option>
                        <option
                            value="Courier New"
                            style={{ fontFamily: 'Courier New' }}
                        >
                            Courier New
                        </option>
                        {/* Add more fonts as needed */}
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
                        type="number"
                        value={isNaN(fontSize) ? '' : fontSize}
                        onChange={(e) =>
                            onFontSizeChange(parseInt(e.target.value, 10))
                        }
                        onBlur={(e) => handleFontSizeBlur(e.target.value)}
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
