import classnames from 'classnames';
import * as jsonpatch from 'fast-json-patch';

import styles from './variants.module.scss';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core';
import AddVariant from './AddFeatureVariant/AddFeatureVariant';

import { useContext, useEffect, useState } from 'react';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { useParams } from 'react-router';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import AccessContext from '../../../../../contexts/AccessContext';
import FeatureVariantListItem from './FeatureVariantsListItem/FeatureVariantsListItem';
import { UPDATE_FEATURE } from '../../../../AccessProvider/permissions';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import useUnleashContext from '../../../../../hooks/api/getters/useUnleashContext/useUnleashContext';
import GeneralSelect from '../../../../common/GeneralSelect/GeneralSelect';
import { IFeatureVariant } from '../../../../../interfaces/featureToggle';
import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from '../../../../../hooks/useToast';
import { updateWeight } from '../../../../common/util';
import cloneDeep from 'lodash.clonedeep';
import useDeleteVariantMarkup from './FeatureVariantsListItem/useDeleteVariantMarkup';

const FeatureOverviewVariants = () => {
    const { hasAccess } = useContext(AccessContext);
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature, refetch } = useFeature(projectId, featureId);
    const [variants, setVariants] = useState<IFeatureVariant[]>([]);
    const [editing, setEditing] = useState(false);
    const { context } = useUnleashContext();
    const { toast, setToastData } = useToast();
    const { patchFeatureToggle } = useFeatureApi();
    const [editVariant, setEditVariant] = useState({});
    const [showAddVariant, setShowAddVariant] = useState(false);
    const [stickinessOptions, setStickinessOptions] = useState([]);
    const [delDialog, setDelDialog] = useState({ name: '', show: false });

    useEffect(() => {
        if (feature) {
            setClonedVariants(feature.variants);
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [feature.variants]);

    useEffect(() => {
        const options = [
            'default',
            ...context.filter(c => c.stickiness).map(c => c.name),
        ];

        setStickinessOptions(options);
    }, [context]);

    const editable = hasAccess(UPDATE_FEATURE, projectId);

    const setClonedVariants = clonedVariants =>
        setVariants(cloneDeep(clonedVariants));

    const handleCloseAddVariant = () => {
        setShowAddVariant(false);
        setEditing(false);
        setEditVariant({});
    };

    const renderVariants = () => {
        return variants.map(variant => {
            return (
                <FeatureVariantListItem
                    key={variant.name}
                    variant={variant}
                    editVariant={(name: string) => {
                        const v = { ...variants.find(v => v.name === name) };
                        setEditVariant(v);
                        setEditing(true);
                        setShowAddVariant(true);
                    }}
                    setDelDialog={setDelDialog}
                    editable={editable}
                />
            );
        });
    };

    const renderStickiness = () => {
        if (!variants || variants.length < 2) {
            return null;
        }

        const value = variants[0].stickiness || 'default';
        const options = stickinessOptions.map(c => ({ key: c, label: c }));

        // guard on stickiness being disabled for context field.
        if (!stickinessOptions.includes(value)) {
            options.push({ key: value, label: value });
        }

        const onChange = event => {
            updateStickiness(event.target.value);
        };

        return (
            <section style={{ paddingTop: '16px' }}>
                <GeneralSelect
                    label="Stickiness"
                    options={options}
                    value={value}
                    onChange={onChange}
                />
                &nbsp;&nbsp;
                <small
                    className={classnames(styles.paragraph, styles.helperText)}
                    style={{ display: 'block', marginTop: '0.5rem' }}
                >
                    By overriding the stickiness you can control which parameter
                    is used to ensure consistent traffic
                    allocation across variants.{' '}
                    <a
                        href="https://docs.getunleash.io/advanced/toggle_variants"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Read more
                    </a>
                </small>
            </section>
        );
    };

    const updateStickiness = async (stickiness: string) => {
        const newVariants = [...variants].map(variant => {
            return { ...variant, stickiness };
        });

        const patch = createPatch(newVariants);

        if (patch.length === 0) return;

        try {
            await patchFeatureToggle(projectId, featureId, patch);
            refetch();
            setToastData({
                show: true,
                type: 'success',
                text: 'Successfully updated variant stickiness',
            });
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    const removeVariant = async (name: string) => {
        console.log(`Removing variant ${name}`);
        let updatedVariants = variants.filter(v => v.name !== name);
        try {
            await updateVariants(
                updatedVariants,
                'Successfully removed variant'
            );
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };
    const updateVariant = async (variant: IFeatureVariant) => {
        const updatedVariants = cloneDeep(variants);
        const variantIdxToUpdate = updatedVariants.findIndex(
            (v: IFeatureVariant) => v.name === variant.name
        );
        updatedVariants[variantIdxToUpdate] = variant;
        await updateVariants(updatedVariants, 'Successfully updated variant');
    };

    const saveNewVariant = async (variant: IFeatureVariant) => {
        let stickiness = 'default';
        if (variants?.length > 0) {
            stickiness = variants[0].stickiness || 'default';
        }
        variant.stickiness = stickiness;

        await updateVariants(
            [...variants, variant],
            'Successfully added a variant'
        );
    };

    const updateVariants = async (
        variants: IFeatureVariant[],
        successText: string
    ) => {
        const newVariants = updateWeight(variants, 1000);

        const patch = createPatch(newVariants);

        if (patch.length === 0) return;
        await patchFeatureToggle(projectId, featureId, patch);
        refetch();
        setToastData({
            show: true,
            type: 'success',
            text: successText,
        });
    };

    const validateName = (name: string) => {
        if (!name) {
            return { name: 'Name is required' };
        }
    };
    const delDialogueMarkup = useDeleteVariantMarkup({
        show: delDialog.show,
        onClick: e => {
            removeVariant(delDialog.name);
            setDelDialog({ name: '', show: false });
            setToastData({
                show: true,
                type: 'success',
                text: `Successfully deleted variant`,
            });
        },
        onClose: () => setDelDialog({ show: false, name: '' }),
    });

    const createPatch = (newVariants: IFeatureVariant[]) => {
        const patch = jsonpatch
            .compare(feature.variants, newVariants)
            .map(patch => {
                return { ...patch, path: `/variants${patch.path}` };
            });
        return patch;
    };

    return (
        <section style={{ padding: '16px' }}>
            <Typography variant="body1">
                Variants allows you to return a variant object if the feature
                toggle is considered enabled for the current request. When using
                variants you should use the{' '}
                <code style={{ color: 'navy' }}>getVariant()</code> method in
                the Client SDK.
            </Typography>

            <ConditionallyRender
                condition={variants?.length > 0}
                show={
                    <Table className={styles.variantTable}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Variant name</TableCell>
                                <TableCell className={styles.labels} />
                                <TableCell>Weight</TableCell>
                                <TableCell>Weight Type</TableCell>
                                <TableCell className={styles.actions} />
                            </TableRow>
                        </TableHead>
                        <TableBody>{renderVariants()}</TableBody>
                    </Table>
                }
                elseShow={<p>No variants defined.</p>}
            />

            <br />
            <ConditionallyRender
                condition={editable}
                show={
                    <div>
                        <Button
                            title="Add variant"
                            onClick={() => {
                                setEditing(false);
                                setEditVariant({});
                                setShowAddVariant(true);
                            }}
                            variant="contained"
                            color="primary"
                            className={styles.addVariantButton}
                            data-test={'ADD_VARIANT_BUTTON'}
                        >
                            Add variant
                        </Button>
                        {renderStickiness()}
                    </div>
                }
            />
            <AddVariant
                showDialog={showAddVariant}
                closeDialog={handleCloseAddVariant}
                save={async (variantToSave: IFeatureVariant) => {
                    if (!editing) {
                        return saveNewVariant(variantToSave);
                    } else {
                        return updateVariant(variantToSave);
                    }
                }}
                editing={editing}
                validateName={validateName}
                editVariant={editVariant}
                title={editing ? 'Edit variant' : 'Add variant'}
            />

            {toast}
            {delDialogueMarkup}
        </section>
    );
};

export default FeatureOverviewVariants;

// class UpdateVariantComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = { ...initialState };
//     }

//     closeDialog = () => {
//         this.setState({ ...initialState });
//     };

//     openAddVariant = e => {
//         e.preventDefault();
//         this.setState({
//             showDialog: true,
//             editVariant: undefined,
//             editIndex: undefined,
//             title: 'Add variant',
//         });
//     };

//     openEditVariant = (e, index, variant) => {
//         e.preventDefault();
//         if (this.props.editable) {
//             this.setState({
//                 showDialog: true,
//                 editVariant: variant,
//                 editIndex: index,
//                 title: 'Edit variant',
//             });
//         }
//     };

//     validateName = name => {
//         if (!name) {
//             return { name: 'Name is required' };
//         }
//     };

//     onRemoveVariant = (e, index) => {
//         e.preventDefault();
//         try {
//             this.props.removeVariant(index);
//         } catch (e) {
//             console.log('An exception was caught.');
//         }
//     };

//     renderVariant = (variant, index) => (
//         <VariantViewComponent
//             key={variant.name}
//             variant={variant}
//             editVariant={e => this.openEditVariant(e, index, variant)}
//             removeVariant={e => this.onRemoveVariant(e, index)}
//             editable={this.props.editable}
//         />
//     );

//     renderVariants = variants => (
//         <Table className={styles.variantTable}>
//             <TableHead>
//                 <TableRow>
//                     <TableCell>Variant name</TableCell>
//                     <TableCell className={styles.labels} />
//                     <TableCell>Weight</TableCell>
//                     <TableCell>Weight Type</TableCell>
//                     <TableCell className={styles.actions} />
//                 </TableRow>
//             </TableHead>
//             <TableBody>{variants.map(this.renderVariant)}</TableBody>
//         </Table>
//     );

//     renderStickiness = variants => {
//         const { updateStickiness, stickinessOptions } = this.props;

//         if (!variants || variants.length < 2) {
//             return null;
//         }

//         const value = variants[0].stickiness || 'default';
//         const options = stickinessOptions.map(c => ({ key: c, label: c }));

//         // guard on stickiness being disabled for context field.
//         if (!stickinessOptions.includes(value)) {
//             options.push({ key: value, label: value });
//         }

//         const onChange = event => updateStickiness(event.target.value);

//         return (
//             <section style={{ paddingTop: '16px' }}>
//                 <GeneralSelect
//                     label="Stickiness"
//                     options={options}
//                     value={value}
//                     onChange={onChange}
//                 />
//                 &nbsp;&nbsp;
//                 <small
//                     className={classnames(styles.paragraph, styles.helperText)}
//                     style={{ display: 'block', marginTop: '0.5rem' }}
//                 >
//                     By overriding the stickiness you can control which parameter
//                     you want to be used in order to ensure consistent traffic
//                     allocation across variants.{' '}
//                     <a
//                         href="https://docs.getunleash.io/advanced/toggle_variants"
//                         target="_blank"
//                         rel="noreferrer"
//                     >
//                         Read more
//                     </a>
//                 </small>
//             </section>
//         );
//     };

//     render() {
//         const { showDialog, editVariant, editIndex, title } = this.state;
//         const { variants, addVariant, updateVariant } = this.props;
//         const saveVariant = editVariant
//             ? updateVariant.bind(null, editIndex)
//             : addVariant;

//         return (
//             <section style={{ padding: '16px' }}>
//                 <Typography variant="body1">
//                     Variants allows you to return a variant object if the
//                     feature toggle is considered enabled for the current
//                     request. When using variants you should use the{' '}
//                     <code style={{ color: 'navy' }}>getVariant()</code> method
//                     in the Client SDK.
//                 </Typography>

//                 <ConditionallyRender
//                     condition={variants.length > 0}
//                     show={this.renderVariants(variants)}
//                     elseShow={<p>No variants defined.</p>}
//                 />

//                 <br />
//                 <ConditionallyRender
//                     condition={this.props.editable}
//                     show={
//                         <div>
//                             <Button
//                                 title="Add variant"
//                                 onClick={this.openAddVariant}
//                                 variant="contained"
//                                 color="primary"
//                                 className={styles.addVariantButton}
//                             >
//                                 Add variant
//                             </Button>
//                             {this.renderStickiness(variants)}
//                         </div>
//                     }
//                 />

//                 <AddVariant
//                     showDialog={showDialog}
//                     closeDialog={this.closeDialog}
//                     save={saveVariant}
//                     validateName={this.validateName}
//                     editVariant={editVariant}
//                     title={title}
//                 />
//             </section>
//         );
//     }
// }

// UpdateVariantComponent.propTypes = {
//     variants: PropTypes.array.isRequired,
//     addVariant: PropTypes.func.isRequired,
//     removeVariant: PropTypes.func.isRequired,
//     updateVariant: PropTypes.func.isRequired,
//     updateStickiness: PropTypes.func.isRequired,
//     editable: PropTypes.bool.isRequired,
//     stickinessOptions: PropTypes.array,
// };

// export default UpdateVariantComponent;