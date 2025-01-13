'use client';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/Tooltip';
import React from 'react';

interface HintProps {
    label: string;
    children: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    alignOffset?: number;
    tooltipArrow?: boolean;
    deleyDuration?: number;
}

const Hint = ({
    label,
    children,
    side,
    align,
    sideOffset,
    alignOffset,
    tooltipArrow,
    deleyDuration,
}: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    className="text-white bg-black border-black rounded-3xl"
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                >
                    <p className="font-semibold capitalize">{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default Hint;
