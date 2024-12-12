import React, { memo } from 'react';

interface FontPickerProps {
    fontName: string;
    onFontChange: (fontName: string) => void;
    fontSize: number;
    onFontSizeChange: (size: string) => void;
}

export const FontPicker: React.FC<FontPickerProps> = memo(({ fontName, onFontChange, fontSize, onFontSizeChange }) => {
    return (
        <>
            <div className="mb-2">
                <label className="text-sm mb-1 block">Font</label>
                <select
                    value={fontName}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="border rounded p-1 text-sm w-full"
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    {/* Add more fonts as needed */}
                </select>
            </div>

            {/* Font size */}
            <div className="mb-2">
                <label className="text-sm mb-1 block">Font Size</label>
                <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(e.target.value)}
                    className="border rounded p-1 text-sm w-full"
                    min={1}
                />
            </div>
        </>
    );
});

FontPicker.displayName = 'FontPicker';