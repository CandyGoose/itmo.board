'use client';

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { EmptySearch } from './EmptySearch';
import BoardCard from './board-card/Index';
import { NewBoardButton } from './NewBoardButton';

interface BoardListProps {
    orgId: string;
    query: {
        search?: string;
    };
}

export const BoardList = ({ orgId, query }: BoardListProps) => {
    const data = useQuery(api.Boards.getAllByOrgId, {
        orgId,
        ...query,
    });

    if (data === undefined) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                <NewBoardButton orgId={orgId} disabled={true}/>
                <BoardCard.Skeleton/>
                <BoardCard.Skeleton/>
                <BoardCard.Skeleton/>
                <BoardCard.Skeleton/>
                <BoardCard.Skeleton/>
            </div>
        );
    }
    if (!data?.length && query.search) {
        return <EmptySearch/>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
            <NewBoardButton orgId={orgId} disabled={false} />
            {data?.map((board) => {
                return (
                    <BoardCard
                        key={board._id}
                        id={board._id}
                        title={board.title}
                        imageUrl={board.imageUrl}
                        authorId={board.authorId}
                        authorName={board.authorName}
                        createdAt={board._creationTime}
                        orgId={board.orgId}
                    />
                );
            })}
        </div>
    );
};
