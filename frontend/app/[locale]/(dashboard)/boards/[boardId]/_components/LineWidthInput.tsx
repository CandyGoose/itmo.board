import React, { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface LineWidthInputProps {
    lineWidth: number;
    onLineWidthChange: (width: number) => void;
}

export const LineWidthInput: React.FC<LineWidthInputProps> = memo(
    ({ lineWidth, onLineWidthChange }) => {
        const t = useTranslations('tools');
        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const width = parseInt(e.target.value, 10);
                if (!isNaN(width)) {
                    onLineWidthChange(width);
                }
            },
            [onLineWidthChange],
        );

        return (
            <div className="flex flex-col mb-2">
                <label className="text-sm mb-1" htmlFor="line-width-input">
                    {t('lineWidth')}
                </label>
                <div className="flex items-center">
                    <input
                        id="line-width-input"
                        type="number"
                        value={lineWidth}
                        onChange={handleChange}
                        className="border rounded p-1 text-sm mr-1 w-2/3
                            bg-[var(--background-color)]
                            text-[var(--text-color)]
                            border-[var(--border)]"
                        min={1}
                    />
                    <div
                        role="presentation"
                        className="bg-[var(--text-color)] w-1/3"
                        style={{ height: `${lineWidth}px` }}
                    />
                </div>
            </div>
        );
    },
);

LineWidthInput.displayName = 'LineWidthInput';
