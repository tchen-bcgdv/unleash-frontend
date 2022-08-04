import { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { FeatureMetricsStats } from 'component/feature/FeatureView/FeatureMetrics/FeatureMetricsStats/FeatureMetricsStats';
import { SectionSeparator } from '../SectionSeparator/SectionSeparator';
import { useTranslation } from 'react-i18next';

interface IEnvironmentFooterProps {
    environmentMetric?: IFeatureEnvironmentMetrics;
}

export const EnvironmentFooter = ({
    environmentMetric,
}: IEnvironmentFooterProps) => {
    const { t } = useTranslation()
    if (!environmentMetric) {
        return null;
    }

    return (
        <>
            <SectionSeparator>{t('feature.singular_title')} exposure</SectionSeparator>

            <div>
                <FeatureMetricsStats
                    totalYes={environmentMetric.yes}
                    totalNo={environmentMetric.no}
                    hoursBack={1}
                />
            </div>
        </>
    );
};
