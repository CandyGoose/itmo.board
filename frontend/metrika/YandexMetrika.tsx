import React, {useEffect} from "react";
import Script from 'next/script'
import {usePathname, useSearchParams} from "next/navigation";

export default function YandexMetrika() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const url = `${pathname}?${searchParams}`

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.ym(process.env.YANDEX_METRIKA_ID, 'hit', url);

    }, [pathname, searchParams])

    return (
        <>
            <Script id="metrika-counter" strategy="afterInteractive">
                {`(
                function(m, e, t, r, i, k, a) {
                    m[i] = m[i] || function() {
                        (m[i].a = m[i].a || []).push(arguments)
                    };
                    m[i].l = 1 * new Date();
                    for (var j = 0; j < document.scripts.length; j++) {
                        if (document.scripts[j].src === r) { 
                            return; 
                        }
                    }
                    k = e.createElement(t)
                    a = e.getElementsByTagName(t)[0]
                    k.async = 1
                    k.src = r
                    a.parentNode.insertBefore(k,a)
                }
            )(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
         
            ym(
                ${process.env.YANDEX_METRIKA_ID},
                "init", 
                {
                    defer: true,
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,
                    webvisor:true
                }
            );`
                }
            </Script>
        </>
    );
}