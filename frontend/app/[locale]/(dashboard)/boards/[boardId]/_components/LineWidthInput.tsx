import React, { memo } from 'react';

interface LineWidthInputProps {
    lineWidth: number;
    onLineWidthChange: (width: string) => void;
}

export const LineWidthInput: React.FC<LineWidthInputProps> = memo(
    ({ lineWidth, onLineWidthChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onLineWidthChange(e.target.value);
        };

        return (
            <div className="flex flex-col mb-2">
                <label className="text-sm mb-1">Line Width</label>{' '}
                {/*TODO: Add translation*/}
                <input
                    type="number"
                    value={lineWidth}
                    onChange={handleChange}
                    className="border rounded p-1 text-sm"
                    min={1}
                />
                <div className="mt-1 flex items-center">
                    <div
                        className="bg-black"
                        style={{ width: '50px', height: `${lineWidth}px` }}
                    />
                </div>
            </div>
        );
    },
);

LineWidthInput.displayName = 'LineWidthInput';
