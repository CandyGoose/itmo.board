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
            <div className="flex flex-col mb-2">
                <label className="text-sm mb-1">{t('lineWidth')}</label>
                <div className="flex items-center">
                    <input
                        type="number"
                        value={lineWidth}
                        onChange={handleChange}
                        className="border rounded p-1 text-sm mr-1 w-2/3"
                        min={1}
                    />
                    <div
                        className="bg-black w-1/3"
                        style={{height: `${lineWidth}px` }}
                    />
                </div>
            </div>
        );
    },
);

LineWidthInput.displayName = 'LineWidthInput';
