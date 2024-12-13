import React, { memo } from 'react';
import { useTranslations } from 'next-intl';

interface TransparentFillCheckerProps {
    transparentFill: boolean;
    onTransparentFillChange: (checked: boolean) => void;
}

export const TransparentFillChecker: React.FC<TransparentFillCheckerProps> =
    memo(({ transparentFill, onTransparentFillChange }) => {
        const t = useTranslations('tools');
        return (
            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    checked={transparentFill}
                    onChange={(e) => onTransparentFillChange(e.target.checked)}
                    className="mr-2"
                />
                <label className="text-sm">{t('transparentFill')}</label>
            </div>
        );
    });

TransparentFillChecker.displayName = 'TransparentFillChecker';
