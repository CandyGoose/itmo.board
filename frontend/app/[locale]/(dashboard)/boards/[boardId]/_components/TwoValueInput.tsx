import React, { memo } from 'react';

interface TwoValueInputProps {
    label: string;
    value1: number;
    value2: number;
    onChange1: (value: string) => void;
    onChange2: (value: string) => void;
}

export const TwoValueInput: React.FC<TwoValueInputProps> = memo(({ label, value1, value2, onChange1, onChange2 }) => {
    return (
        <div className="mb-2">
            <label className="text-sm">{label}</label>
            <div className="flex gap-1">
                <input
                    type="number"
                    value={value1}
                    onChange={(e) => onChange1(e.target.value)}
                    className="border rounded p-1 text-sm w-1/2"
                />
                <input
                    type="number"
                    value={value2}
                    onChange={(e) => onChange2(e.target.value)}
                    className="border rounded p-1 text-sm w-1/2"
                />
            </div>
        </div>
    );
});

TwoValueInput.displayName = 'TwoValueInput';