import axios from 'axios';

export interface Board {
    _id: string;
    title: string;
    orgId: string;
    authorId: string;
    imageUrl: string;
    createdAt?: Date;
}

export async function getAllBoards(
    userId: string,
    orgId: string,
): Promise<Board[]> {
    const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/boards/${userId}/${orgId}`,
    );
    return res.data ? res.data : undefined;
}

export async function getBoardById(boardId: string): Promise<Board> {
    const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`,
    );
    return res.data ? res.data : undefined;
}

export async function createBoard(userId: string, orgId: string) {
    const boards = await getAllBoards(userId, orgId);
    return await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/boards`, {
        title: 'Untitle-' + boards.length,
        orgId: orgId,
        authorId: userId,
        imageUrl: `/placeholders/${Math.floor(Math.random() * 10) + 1}.svg`,
    });
}

export async function renameBoard(id: string, title: string) {
    return await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/boards/title/${id}`,
        {
            title: title,
        },
    );
}

export async function deleteBoard(id: string) {
    return await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/boards/${id}`,
    );
}
