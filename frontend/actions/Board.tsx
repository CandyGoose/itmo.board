import axios from 'axios';
export interface Board {
    _id: string,
    title: string,
    orgId: string,
    authorId: string,
    imageUrl: string,
    createdAt?: Date,
}
export async function getAllBoards(userId: string, orgId: string): Promise<Board[]> {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/boards/${userId}/${orgId}`);
    return res.data ? res.data : undefined;
}