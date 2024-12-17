'use client';

import { memo } from 'react';

import { useOthersConnectionIds, useOthersMapped } from '@/liveblocks.config';

import { Cursor } from './Cursor';
import { shallow } from '@liveblocks/client';
import { Path } from './Path';
import { colorToCss, penPointsToPathLayer } from '@/lib/utils';

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
                    const { width, height } = penPointsToPathLayer(other.pencilDraft)
                    return (
                        <Path
                            key={key}
                            y={0}
                            x={0}
                            points={other.pencilDraft}
                            fill={
                                other.penColor
                                    ? colorToCss(other.penColor)
                                    : '#000'
                            }
                            width={width!}
                            height={height!}
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
