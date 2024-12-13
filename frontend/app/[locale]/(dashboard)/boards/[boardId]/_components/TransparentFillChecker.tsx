import React, { memo } from 'react';

interface TransparentFillCheckerProps {
    transparentFill: boolean;
    onTransparentFillChange: (checked: boolean) => void;
}

export const TransparentFillChecker: React.FC<TransparentFillCheckerProps> =
    memo(({ transparentFill, onTransparentFillChange }) => {
        return (
            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    checked={transparentFill}
                    onChange={(e) => onTransparentFillChange(e.target.checked)}
                    className="mr-2"
                />
                <label className="text-sm">Transparent Fill</label>{' '}
                {/*TODO: Add translation, make font similar to other options*/}
            </div>
        );
    });

TransparentFillChecker.displayName = 'TransparentFillChecker';
