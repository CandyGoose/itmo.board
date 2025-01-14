'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { useOthers, useSelf } from '@/liveblocks.config';
import { connectionIdToColor } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import {useTranslations} from "next-intl";

const MAX_SHOWN_USERS = 10;
const AVATAR_SIZE = 35;
const PADDING = 8;

export const Participants = ({ className = '' }) => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > MAX_SHOWN_USERS;
    const t = useTranslations('tools');

    const totalParticipants =
        users.length + (currentUser ? 1 : 0) + (hasMoreUsers ? 1 : 0);

    const containerWidth =
        totalParticipants <= MAX_SHOWN_USERS
            ? PADDING * 2 + totalParticipants * (AVATAR_SIZE + PADDING)
            : PADDING * 2 + (MAX_SHOWN_USERS + 1) * (AVATAR_SIZE + PADDING);

    return (
        <div
            className={`bg-[var(--background-color)] shadow-md flex justify-center border items-center ${className}`}
            style={{
                width: `${containerWidth}px`,
                padding: `${PADDING / 2}px`,
                borderRadius: `calc(var(--radius) - 2px)`,
            }}
        >
            <div className="flex justify-center items-center gap-2">
                {users
                    .slice(0, MAX_SHOWN_USERS)
                    .map(({ connectionId, info }) => (
                        <UserAvatar
                            key={connectionId}
                            src={info?.picture}
                            name={info?.name}
                            fallback={info?.name?.[0] || `${t('teammate')}`}
                            borderColor={connectionIdToColor(connectionId)}
                            style={{
                                width: `${AVATAR_SIZE}px`,
                                height: `${AVATAR_SIZE}px`,
                            }}
                        />
                    ))}

                {currentUser && (
                    <UserAvatar
                        src={currentUser.info?.picture}
                        name={`${currentUser.info?.name} (${t('you')})`}
                        fallback={currentUser.info?.name?.[0]}
                        borderColor={connectionIdToColor(
                            currentUser.connectionId,
                        )}
                        style={{
                            width: `${AVATAR_SIZE}px`,
                            height: `${AVATAR_SIZE}px`,
                        }}
                    />
                )}

                {hasMoreUsers && (
                    <UserAvatar
                        name={`${users.length - MAX_SHOWN_USERS} more`}
                        fallback={`+${users.length - MAX_SHOWN_USERS}`}
                        style={{
                            width: `${AVATAR_SIZE}px`,
                            height: `${AVATAR_SIZE}px`,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export const ParticipantsSkeleton = () => {
    return (
        <div
            className="top-2 right-2 bg-[var(--background-color)] h-12 absolute p-3 rounded-md flex items-center justify-center shadow-md"
            style={{
                width: '100px',
                borderRadius: `calc(var(--radius) - 2px)`,
            }}
        >
            <Skeleton className="h-full w-full bg-muted-400" />
        </div>
    );
};
