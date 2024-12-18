'use client';

import {
    UserButton,
    OrganizationSwitcher,
    useOrganization,
} from '@clerk/nextjs';

import { SearchInput } from './SearchInput';
import { InviteButton } from './InviteButton';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { LanguageSwitchButton } from '@/app/[locale]/(dashboard)/[UserID]/_components/LanguageSwitchButton';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ThemeToggleButton } from '@/app/[locale]/(dashboard)/[UserID]/_components/ThemeToggleButton';

const font = Poppins({
    subsets: ['latin'],
    weight: ['600'],
});

export const Navbar = () => {
    const { organization } = useOrganization();

    return (
        <div className="flex items-center gap-x-4 p-5">
            <Link href="/">
                <div className="flex items-center gap-x-2">
                    <Image src="/logo.svg" alt="Logo" height={30} width={30} />
                    <span
                        className={cn('font-semibold text-2xl', font.className)}
                    >
                        itmo.board
                    </span>
                </div>
            </Link>

            <div className="flex-2">
                <OrganizationSwitcher
                    hidePersonal
                    appearance={{
                        elements: {
                            rootBox: {
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                            },
                            organizationSwitcherTrigger: `
                                bg-[var(--background-color)] 
                                text-[var(--text-color)] 
                                hover:bg-[var(--foreground)] 
                                hover:text-[var(--background)]
                                dark:bg-[var(--primary)] 
                                dark:text-[var(--primary-foreground)] 
                                dark:hover:bg-[var(--secondary)] 
                                dark:hover:text-[var(--primary-foreground)]
                                [&_span]:text-[var(--primary-foreground)] 
                                dark:[&_span]:text-[var(--primary-foreground)]
                                transition-colors duration-300
                            `,
                        },
                    }}
                />
            </div>

            <div className="hidden lg:flex lg:flex-1 ">
                <SearchInput />
            </div>

            {organization && <InviteButton />}

            <LanguageSwitchButton />

            <ThemeToggleButton />

            <UserButton />
        </div>
    );
};
