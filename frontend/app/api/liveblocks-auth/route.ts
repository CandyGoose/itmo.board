import { Liveblocks } from '@liveblocks/node';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocksSecret = process.env.LIVEBLOCKS_SECRET;

if (!liveblocksSecret) {
    throw new Error(
        'LIVEBLOCKS_SECRET is not defined in the environment variables.',
    );
}

const liveblocks = new Liveblocks({
    secret: liveblocksSecret,
});

export async function POST(request: Request) {
    const authorization = await auth();
    const user = await currentUser();

    if (!authorization || !user) {
        return new Response('Unauthorized', { status: 403 });
    }

    const { room } = await request.json();
    const board = await convex.query(api.Board.get, { id: room });

    if (board?.orgId !== authorization.orgId) {
        return new Response("Unauthorized!", { status: 403 });
    }

    const userInfo = {
        name: user.firstName || 'Teammate',
        picture: user.imageUrl,
    };

    const session = liveblocks.prepareSession(user.id, { userInfo });

    if (room) {
        session.allow(room, session.FULL_ACCESS);
    }

    const { status, body } = await session.authorize();
    return new Response(body, { status });
}
