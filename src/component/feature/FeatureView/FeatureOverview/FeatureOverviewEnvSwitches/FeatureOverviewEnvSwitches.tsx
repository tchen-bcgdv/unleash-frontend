import { Tooltip } from '@mui/material';
import { useState } from 'react';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import FeatureOverviewEnvSwitch from './FeatureOverviewEnvSwitch/FeatureOverviewEnvSwitch';
import { useStyles } from './FeatureOverviewEnvSwitches.styles';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useTranslation } from 'react-i18next';

const FeatureOverviewEnvSwitches = () => {
    const { t }  = useTranslation()
    const { classes: styles } = useStyles();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    useFeatureApi();

    const [showInfoBox, setShowInfoBox] = useState(false);
    const [environmentName, setEnvironmentName] = useState('');

    const closeInfoBox = () => {
        setShowInfoBox(false);
    };

    const renderEnvironmentSwitches = () => {
        return feature?.environments.map(env => {
            return (
                <FeatureOverviewEnvSwitch
                    key={env.name}
                    env={env}
                    showInfoBox={() => {
                        setEnvironmentName(env.name);
                        setShowInfoBox(true);
                    }}
                />
            );
        });
    };

    return (
        <div className={styles.container}>
            <Tooltip
                arrow
                title={`Environments can be switched off for a single ${t('feature.singular')}. Resulting in all calls towards the ${t('feature.singular')} to return false.`}
            >
                <h3 className={styles.header} data-loading>
                    {t('feature.singular_title')} status
                </h3>
            </Tooltip>
            {renderEnvironmentSwitches()}
            <EnvironmentStrategyDialog
                open={showInfoBox}
                onClose={closeInfoBox}
                projectId={projectId}
                featureId={featureId}
                environmentName={environmentName}
            />
        </div>
    );
};

export default FeatureOverviewEnvSwitches;
