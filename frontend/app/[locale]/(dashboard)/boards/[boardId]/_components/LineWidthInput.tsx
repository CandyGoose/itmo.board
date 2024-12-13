import React, { memo } from 'react';
import { useTranslations } from 'next-intl';

interface LineWidthInputProps {
    lineWidth: number;
    onLineWidthChange: (width: string) => void;
}

export const LineWidthInput: React.FC<LineWidthInputProps> = memo(
    ({ lineWidth, onLineWidthChange }) => {
        const t = useTranslations('tools');
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onLineWidthChange(e.target.value);
        };

        return (
            <div className="flex items-center mb-2">
                <label className="text-sm mr-2">{t('lineWidth')}</label>
                <input
                    type="number"
                    value={lineWidth}
                    onChange={handleChange}
                    className="border rounded p-1 text-sm mr-2 w-14"
                    min={1}
                />
                <div
                    className="bg-black"
                    style={{ width: '40px', height: `${lineWidth}px` }}
                />
            </div>
        );
    },
);

LineWidthInput.displayName = 'LineWidthInput';
