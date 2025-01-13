'use client';

import { useEffect, useState, useCallback } from 'react';
import { EmptySearch } from './EmptySearch';
import { NewBoardButton } from './NewBoardButton';
import { useParams, useSearchParams } from 'next/navigation';
import { BoardCard } from './board-card/Index';
import { Board, getAllBoards } from '@/actions/Board';

interface BoardListProps {
    orgId: string;
    query: {
        search?: string;
    };
}

export const BoardList = ({ orgId, query }: BoardListProps) => {
    const [data, setData] = useState<Board[]>([]);
    const [filteredData, setFilteredData] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const searchParams = useSearchParams();

    const fetchBoards = useCallback(async (userId: string, orgId: string) => {
        try {
            setLoading(true);
            const boards = await getAllBoards(userId, orgId);
            setData(boards);
        } catch (error) {
            console.error('Error fetching boards:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (params.UserID) {
            fetchBoards(params.UserID as string, orgId);
        }
    }, [orgId, params.UserID, fetchBoards]);

    useEffect(() => {
        const searchQuery = searchParams.get('search')?.toLowerCase() || '';
        const filteredBoards = data.filter((board) =>
            board.title.toLowerCase().includes(searchQuery),
        );
        setFilteredData(filteredBoards);
    }, [data, searchParams]);

    const handleBoardCreated = (newBoard: Board) => {
        setData((prevData) => [newBoard, ...prevData]);
        setFilteredData((prevFilteredData) => [newBoard, ...prevFilteredData]);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                <BoardCard.Skeleton />
                <BoardCard.Skeleton />
                <BoardCard.Skeleton />
                <BoardCard.Skeleton />
            </div>
        );
    }

    if (!filteredData.length && query.search) {
        return <EmptySearch />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
            <NewBoardButton orgId={orgId} onBoardCreated={handleBoardCreated} />
            {filteredData.map((board) => (
                <BoardCard
                    key={board._id}
                    id={board._id}
                    title={board.title}
                    imageUrl={board.imageUrl}
                    authorId={board.authorId}
                    createdAt={new Date(board.createdAt || '').toISOString()}
                    orgId={board.orgId}
                />
            ))}
        </div>
    );
};
