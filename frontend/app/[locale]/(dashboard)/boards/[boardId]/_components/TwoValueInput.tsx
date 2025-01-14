import React, { memo } from 'react';

interface TwoValueInputProps {
    label1: string;
    label2: string;
    value1: number;
    value2: number;
    onChange1: (value: number) => void;
    onChange2: (value: number) => void;
    className?: string;
}

export const TwoValueInput: React.FC<TwoValueInputProps> = memo(
    ({ label1, label2, value1, value2, onChange1, onChange2, className }) => {
        const parseAndRound = (value: string) => {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
        };
        return (
            <div className={`flex gap-4 items-center ${className || ''}`}>
                <div className="flex flex-col w-1/2">
                    <label className="text-sm" htmlFor="input1">
                        {label1}
                    </label>
                    <input
                        id="input1"
                        type="text"
                        value={value1}
                        onChange={(e) =>
                            onChange1(parseAndRound(e.target.value))
                        }
                        className="border rounded p-1 text-sm w-full
                            bg-[var(--background-color)]
                            text-[var(--text-color)]
                            border-[var(--border)]"
                    />
                </div>
                <div className="flex flex-col w-1/2">
                    <label className="text-sm" htmlFor="input2">
                        {label2}
                    </label>
                    <input
                        id="input2"
                        type="text"
                        value={value2}
                        onChange={(e) =>
                            onChange2(parseAndRound(e.target.value))
                        }
                        className="border rounded p-1 text-sm w-full
                            bg-[var(--background-color)]
                            text-[var(--text-color)]
                            border-[var(--border)]"
                    />
                </div>
            </div>
        );
    },
);

TwoValueInput.displayName = 'TwoValueInput';
