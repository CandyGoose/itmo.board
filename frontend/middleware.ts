import { NextFetchEvent, NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function combinedMiddleware(
    req: NextRequest,
    event: NextFetchEvent,
) {
    // Skip intlMiddleware for API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
        // Directly return Clerk's middleware handler for API routes
        return clerkMiddleware()(req, event);
    }

    const clerkHandler = clerkMiddleware();

    await clerkHandler(req, event);

    return intlMiddleware(req);
}

export const config = {
    matcher: [
        '/((?!.+\\.[\\w]+$|_next).*)',
        '/',
        '/(api|trpc)(.*)',
        '/api/(.*)', // Explicitly match API routes
        // '/(.*)/board/(.*)',
    ],
};
