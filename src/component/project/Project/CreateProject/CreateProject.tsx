import { useNavigate } from 'react-router-dom';
import ProjectForm from '../ProjectForm/ProjectForm';
import useProjectForm from '../hooks/useProjectForm';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';
import { useTranslation } from 'react-i18next';

const CreateProject = () => {
    const { t } = useTranslation();
    const { setToastData, setToastApiError } = useToast();
    const { refetchUser } = useAuthUser();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const {
        projectId,
        projectName,
        projectDesc,
        setProjectId,
        setProjectName,
        setProjectDesc,
        getProjectPayload,
        clearErrors,
        validateProjectId,
        validateName,
        errors,
    } = useProjectForm();

    const { createProject, loading } = useProjectApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = validateName();
        const validId = await validateProjectId();

        if (validName && validId) {
            const payload = getProjectPayload();
            try {
                await createProject(payload);
                refetchUser();
                navigate(`/projects/${projectId}`);
                setToastData({
                    title: `${t('project.singular_title')} created`,
                    text: `Now you can add ${t('feature.plural')} to this project`,
                    confetti: true,
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getProjectPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title={`Create ${t('project.singular')}`}
            description={`${t('project.plural_title')} allow you to group ${t('feature.plural')} together in the management UI.`}
            documentationLink="https://docs.getunleash.io/user_guide/projects"
            documentationLinkLabel={`${t('project.plural_title')} documentation`}
            formatApiCode={formatApiCode}
        >
            <ProjectForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                projectId={projectId}
                setProjectId={setProjectId}
                projectName={projectName}
                setProjectName={setProjectName}
                projectDesc={projectDesc}
                setProjectDesc={setProjectDesc}
                mode="Create"
                clearErrors={clearErrors}
                validateProjectId={validateProjectId}
            >
                <CreateButton name={t('project.singular')} permission={CREATE_PROJECT} />
            </ProjectForm>
        </FormTemplate>
    );
};

export default CreateProject;
