import React, { memo } from 'react';

interface TwoValueInputProps {
    label1: string;
    label2: string;
    value1: number;
    value2: number;
    onChange1: (value: string) => void;
    onChange2: (value: string) => void;
}

export const TwoValueInput: React.FC<TwoValueInputProps> = memo(
    ({ label1, label2, value1, value2, onChange1, onChange2 }) => {
        return (
            <div className="mb-2">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col w-1/2">
                        <label className="text-sm">{label1}</label>
                        <input
                            type="number"
                            value={value1}
                            onChange={(e) => onChange1(e.target.value)}
                            className="border rounded p-1 text-sm w-full"
                        />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label className="text-sm">{label2}</label>
                        <input
                            type="number"
                            value={value2}
                            onChange={(e) => onChange2(e.target.value)}
                            className="border rounded p-1 text-sm w-full"
                        />
                    </div>
                </div>
            </div>
        );
    },
);

TwoValueInput.displayName = 'TwoValueInput';
