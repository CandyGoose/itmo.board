'use client';

import qs from 'query-string';
import { Search } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';

export const SearchInput = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 500);

    const t = useTranslations('search');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    useEffect(() => {
        const url = qs.stringifyUrl(
            {
                url: pathname,
                query: {
                    search: debouncedValue,
                },
            },
            { skipEmptyString: true, skipNull: true },
        );

        router.replace(url);
    }, [debouncedValue, pathname, router]);

    return (
        <div className="w-full relative">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                className="w-full max-w-[516px] pl-9"
                placeholder={t('searchBoards')}
                onChange={handleChange}
                value={value}
            />
        </div>
    );
};
