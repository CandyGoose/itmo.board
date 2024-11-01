'use client';

import React from 'react';
import { ToolButton } from './ToolButton';
import { Brush, Eraser } from 'lucide-react';
import ColorPicker from "@/app/(dashboard)/boards/[boardId]/_components/ColorPicker";

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
                aria-label="Brush Tool" // Добавляем aria-label для доступности
            />
            <ToolButton
                label="Eraser"
                icon={Eraser}
                onClick={() => onSelectTool('eraser')}
                isActive={currentColor === 'eraser'}
                aria-label="Eraser Tool" // Добавляем aria-label для доступности
            />
            <ColorPicker color={currentColor} onChange={onColorChange} />
        </div>
    );
};

export default Toolbar;