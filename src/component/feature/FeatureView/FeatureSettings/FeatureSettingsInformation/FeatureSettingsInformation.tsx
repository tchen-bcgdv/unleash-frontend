import { Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useStyles } from './FeatureSettingsInformation.style';
import { useTranslation } from 'react-i18next';

interface IFeatureSettingsInformationProps {
    projectId: string;
    featureId: string;
}

export const FeatureSettingsInformation = ({
    projectId,
    featureId,
}: IFeatureSettingsInformationProps) => {
    const { t } = useTranslation()
    const { classes: styles } = useStyles();
    const { feature } = useFeature(projectId, featureId);
    const navigate = useNavigate();

    const onEdit = () => {
        navigate(`/projects/${projectId}/features/${featureId}/edit`);
    };

    return (
        <>
            <div className={styles.container}>
                <Typography className={styles.header}>
                    {t('feature.singular_title')} information
                </Typography>
                <PermissionIconButton
                    permission={UPDATE_FEATURE}
                    projectId={projectId}
                    data-loading
                    onClick={onEdit}
                    tooltipProps={{ title: 'Edit' }}
                >
                    <Edit />
                </PermissionIconButton>
            </div>
            <Typography>
                Name: <strong>{feature.name}</strong>
            </Typography>
            <Typography>
                Description:{' '}
                <strong>
                    {!feature.description?.length
                        ? 'no description'
                        : feature.description}
                </strong>
            </Typography>
            <Typography>
                Type: <strong>{feature.type}</strong>
            </Typography>
            <Typography>
                Impression Data:{' '}
                <strong>
                    {feature.impressionData ? 'enabled' : 'disabled'}
                </strong>
            </Typography>
        </>
    );
};
