import { ArchiveTable } from './ArchiveTable/ArchiveTable';
import { SortingRule } from 'react-table';
import { useProjectFeaturesArchive } from 'hooks/api/getters/useProjectFeaturesArchive/useProjectFeaturesArchive';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useTranslation } from 'react-i18next';

const defaultSort: SortingRule<string> = { id: 'archivedAt' };

interface IProjectFeaturesTable {
    projectId: string;
}

export const ProjectFeaturesArchiveTable = ({
    projectId,
}: IProjectFeaturesTable) => {
    const { t } = useTranslation();
    const {
        archivedFeatures = [],
        refetchArchived,
        loading,
    } = useProjectFeaturesArchive(projectId);

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectFeaturesArchiveTable`,
        defaultSort
    );

    return (
        <ArchiveTable
            title={`${t('project.singular_title')} archive`}
            archivedFeatures={archivedFeatures}
            loading={loading}
            storedParams={value}
            setStoredParams={setValue}
            refetch={refetchArchived}
            projectId={projectId}
        />
    );
};
