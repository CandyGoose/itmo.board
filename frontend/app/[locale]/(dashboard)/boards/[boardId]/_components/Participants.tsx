'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { useOthers, useSelf } from '@/liveblocks.config';
import { connectionIdToColor } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';

const MAX_SHOWN_USERS = 4;

export const Participants = ({ className = '' }) => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > MAX_SHOWN_USERS;

    return (
        <div
            className={`bg-white h-12 rounded-md shadow-md flex items-center justify-center ${className}`}
        >
            <div className="flex gap-x-2">
                {users
                    .slice(0, MAX_SHOWN_USERS)
                    .map(({ connectionId, info }) => (
                        <UserAvatar
                            key={connectionId}
                            src={info?.picture}
                            name={info?.name}
                            fallback={info?.name?.[0] || 'Teammate'}
                            borderColor={connectionIdToColor(connectionId)}
                        />
                    ))}

                {currentUser && (
                    <UserAvatar
                        src={currentUser.info?.picture}
                        name={`${currentUser.info?.name} (You)`}
                        fallback={currentUser.info?.name?.[0]}
                        borderColor={connectionIdToColor(
                            currentUser.connectionId,
                        )}
                    />
                )}

                {hasMoreUsers && (
                    <UserAvatar
                        name={`${users.length - MAX_SHOWN_USERS} more`}
                        fallback={`+${users.length - MAX_SHOWN_USERS}`}
                    />
                )}
            </div>
        </div>
    );
};

export const ParticipantsSkeleton = () => {
    return (
        <div className="top-2 right-2 bg-white h-12 absolute p-3 rounded-md flex items-center shadow-md w-[100px]">
            <Skeleton className="h-full w-full bg-muted-400" />
        </div>
    );
};
