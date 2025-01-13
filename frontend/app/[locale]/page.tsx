'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { redirect } from '@/i18n/routing';
import { useEffect } from 'react';

export default function HomePage() {
    const { userId } = useAuth();

    useEffect(() => {
        if (userId) {
            redirect({ href: `/${userId}`, locale: 'en' });
        } else {
            redirect({ href: '/sign-in', locale: 'en' });
        }
    }, [userId]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Loader className="animate-spin" />
        </div>
    );
}
