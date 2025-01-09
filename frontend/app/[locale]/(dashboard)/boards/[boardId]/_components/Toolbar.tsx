import React, { useState } from 'react';
import { CanvasMode, CanvasState, LayerType } from '@/types/canvas';
import { ToolButton } from './ToolButton';
import {
    Trash2,
    BringToFront,
    SendToBack,
    MoreVertical,
    ArrowDown,
    ArrowUp,
    Pencil,
    MousePointer2,
    Square,
    Circle,
    StickyNote,
    Undo2,
    Redo2,
    Type,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface ToolbarProps {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    editable: boolean;
    deleteSelected: () => void;
    moveToFront: () => void;
    moveToBack: () => void;
    moveForward: () => void;
    moveBackward: () => void;
}

export const ToolBar = ({
    canvasState,
    setCanvasState,
    undo,
    redo,
    canUndo,
    canRedo,
    editable,
    deleteSelected,
    moveToFront,
    moveToBack,
    moveForward,
    moveBackward,
}: ToolbarProps) => {
    const [showExtraTools, setShowExtraTools] = useState(false);

    const handleToggleExtraTools = () => setShowExtraTools((prev) => !prev);

    const t = useTranslations('tools');

    const extraTools = [
        { label: t('bringToFront'), icon: BringToFront, action: moveToFront },
        { label: t('bringToBack'), icon: SendToBack, action: moveToBack },
        { label: t('moveForward'), icon: ArrowUp, action: moveForward },
        { label: t('moveBackward'), icon: ArrowDown, action: moveBackward },
    ];

    return (
        <div className="absolute bottom-5 left-[50%] -translate-x-[50%] flex items-center">
            {/* Toggle button for extra tools */}
            <div className="relative flex flex-col items-center">
                <div className="p-2 bg-[var(--background-color)] rounded-md shadow-md">
                    <ToolButton
                        label={t('more')}
                        icon={MoreVertical}
                        onClick={handleToggleExtraTools}
                    />
                </div>

                {/* Extra tools dropdown */}
                {showExtraTools && (
                    <div className="flex gap-4 p-2 bg-[var(--background-color)] rounded-md shadow-md absolute bottom-full mb-2">
                        {extraTools.map((tool, index) => (
                            <ToolButton
                                key={index}
                                label={tool.label}
                                icon={tool.icon}
                                onClick={tool.action}
                                isDisabled={!editable}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Spacer with 4-pixel gap */}
            <div style={{ width: '4px' }} />

            {/* Main toolbar */}
            <div className="flex gap-x-2 p-2 bg-[var(--background-color)] rounded-md shadow-md">
                <ToolButton
                    label={t('select')}
                    icon={MousePointer2}
                    onClick={() => setCanvasState({ mode: CanvasMode.None })}
                    isActive={
                        canvasState.mode === CanvasMode.None ||
                        canvasState.mode === CanvasMode.Translating ||
                        canvasState.mode === CanvasMode.SelectionNet ||
                        canvasState.mode === CanvasMode.Pressing ||
                        canvasState.mode === CanvasMode.Resizing
                    }
                    isDisabled={!editable}
                />
                <ToolButton
                    label={t('pen')}
                    icon={Pencil}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Pencil,
                        })
                    }
                    isActive={canvasState.mode === CanvasMode.Pencil}
                    isDisabled={!editable}
                />
                <ToolButton
                    label={t('rectangle')}
                    icon={Square}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Rectangle,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Rectangle
                    }
                    isDisabled={!editable}
                />
                <ToolButton
                    label={t('ellipse')}
                    icon={Circle}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Ellipse,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Ellipse
                    }
                    isDisabled={!editable}
                />
                <ToolButton
                    label="Text"
                    icon={Type}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Text,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Text
                    }
                    isDisabled={!editable}
                />
                <ToolButton
                    label={t('stickyNote')}
                    icon={StickyNote}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Note,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Note
                    }
                    isDisabled={!editable}
                />
                <ToolButton
                    label={t('undo')}
                    icon={Undo2}
                    onClick={undo}
                    isDisabled={!canUndo || !editable}
                />
                <ToolButton
                    label={t('redo')}
                    icon={Redo2}
                    onClick={redo}
                    isDisabled={!canRedo || !editable}
                />
            </div>

            {/* Spacer with 4-pixel gap */}
            <div style={{ width: '4px' }} />

            {/* Separate Trash button */}
            <div className="p-2 bg-[var(--background-color)] rounded-md shadow-md">
                <ToolButton
                    label={t('delete')}
                    icon={Trash2}
                    onClick={deleteSelected}
                    isDisabled={!editable}
                />
            </div>
        </div>
    );
};

export const ToolBarSkeleton = () => {
    return (
        <div className="absolute bottom-2 left-[50%] -translate-x-[50%] h-[52px] w-[300px] rounded-md shadow-md bg-white" />
    );
};
