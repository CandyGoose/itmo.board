'use client';

import React from 'react';
import ColorPicker from './ColorPicker';
import { ToolButton } from './ToolButton';
import { Brush, Eraser } from 'lucide-react';

interface ToolbarProps {
    onSelectTool: (tool: string) => void;
    onColorChange: (color: string) => void;
    currentColor: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onSelectTool,
    onColorChange,
    currentColor,
}) => {
    return (
        <div className="toolbar">
            <ToolButton
                label="Brush"
                icon={Brush}
                onClick={() => onSelectTool('brush')}
                isActive={currentColor === 'brush'}
            />
            <ToolButton
                label="Eraser"
                icon={Eraser}
                onClick={() => onSelectTool('eraser')}
                isActive={currentColor === 'eraser'}
            />
            <ColorPicker color={currentColor} onChange={onColorChange} />
        </div>
    );
};

export default Toolbar;
