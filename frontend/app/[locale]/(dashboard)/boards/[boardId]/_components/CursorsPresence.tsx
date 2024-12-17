'use client';

import { memo } from 'react';

import { useOthersConnectionIds, useOthersMapped } from '@/liveblocks.config';

import { Cursor } from './Cursor';
import { shallow } from '@liveblocks/client';
import { Path } from './Path';
import { colorToCss } from '@/lib/utils';

const Cursors = () => {
    const ids = useOthersConnectionIds();

    return (
        <>
            {ids.map((connectionId) => (
                <Cursor key={connectionId} connectionId={connectionId} />
            ))}
        </>
    );
};

const Drafts = () => {
    const others = useOthersMapped(
        (other) => ({
            pencilDraft: other.presence.pencilDraft,
            penColor: other.presence.penColor,
        }),
        shallow,
    );

    return (
        <>
            {others.map(([key, other]) => {
                if (other.pencilDraft) {
                    return (
                        <Path
                            key={key}
                            y={0}
                            x={0}
                            width={0}
                            height={0}
                            points={other.pencilDraft}
                            fill={
                                other.penColor
                                    ? colorToCss(other.penColor)
                                    : '#000'
                            }
                            stroke={colorToCss(other.penColor ?? {r: 0, g: 0, b: 0})}
                            lineWidth={4}
                        />
                    );
                }
            })}
        </>
    );
};

export const CursorsPresence = memo(() => {
    return (
        <>
            <Drafts />
            <Cursors />
        </>
    );
});

CursorsPresence.displayName = 'CursorsPresence';
