import React, { FC, useRef } from 'react';
import { colorToCss } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface StylesButtonProps {
    id: string;
    activeColor: { r: number; g: number; b: number };
    onClick: () => void;
    className?: string;
}

export const StylesButton: FC<StylesButtonProps> = ({
    id,
    activeColor,
    onClick,
    className,
}) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const t = useTranslations('utils');

    return (
        <button
            ref={buttonRef}
            id={id}
            onClick={onClick}
            className={`flex items-center gap-2 h-12 p-3 bg-[var(--background-color)] text-[var(--text-color)] rounded-md shadow-md border ${className}`}
        >
            <span
                className="w-4 h-4 rounded-full border"
                style={{
                    backgroundColor: colorToCss(activeColor),
                    borderColor: colorToCss(activeColor),
                }}
            />
            {t('styles')}
        </button>
    );
};
