import { useState } from 'react';
import { HistoryTool } from '@/app/[locale]/components/HistoryTool';
import { useTranslations } from 'next-intl';

export function BoardSettingsPanel() {
    const t = useTranslations('TopSettings');

    const [scaleValue, setScaleValue] = useState(100);

    const handleScaleClicked = () => {
        if (scaleValue < 200) {
            setScaleValue(scaleValue * 0.2);
        } else {
            setScaleValue(scaleValue / 2);
        }
    };

    const handleStyleClicked = () => {};

    return (
        <div>
            <HistoryTool />
            <button onClick={handleScaleClicked}>{scaleValue + '%'}</button>
            <button onClick={handleStyleClicked}>{t('Styles')}</button>
        </div>
    );
}