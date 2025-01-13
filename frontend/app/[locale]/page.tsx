'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (userId) {
            router.replace(`/${userId}`);
        } else {
            router.replace('/sign-in');
        }
    }, [userId, router]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Loader className="animate-spin" />
        </div>
    );
}
