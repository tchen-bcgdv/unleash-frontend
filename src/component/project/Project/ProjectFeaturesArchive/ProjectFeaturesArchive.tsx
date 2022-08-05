import { ProjectFeaturesArchiveTable } from 'component/archive/ProjectFeaturesArchiveTable';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { useTranslation } from 'react-i18next';

export const ProjectFeaturesArchive = () => {
    const { t } = useTranslation();
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    usePageTitle(`${t('project.singular_title')} archive – ${projectName}`);

    return <ProjectFeaturesArchiveTable projectId={projectId} />;
};
