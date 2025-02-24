import { SignUp } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';

type metaProps = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: metaProps) {
    const locale = (await params).locale;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: t('sign-up'),
    };
}

export default function Page() {
    return (
        <div className="w-full h-full flex justify-center items-center relative bg-[#FEEDF2] z-20 overflow-hidden">
            <div className="w-full h-full flex flex-col items-center justify-center px-2 z-30 border border-black">
                <SignUp />
            </div>
            <div className="w-[175%] h-full absolute top-[55%] bg-blue-500 rounded-[90%] z-10" />
            <div className="w-[175%] h-full absolute top-[52%] bg-blue-300 rounded-[90%] -z-10" />
        </div>
    );
}
