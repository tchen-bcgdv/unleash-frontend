import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useStyles } from '../ConstraintAccordion.styles';

interface ConstraintAccordionHeaderActionsProps {
    onDelete?: () => void;
    onEdit?: () => void;
}

export const ConstraintAccordionHeaderActions = ({
    onEdit,
    onDelete,
}: ConstraintAccordionHeaderActionsProps) => {
    const { classes: styles } = useStyles();
    const onEditClick =
        onEdit &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onEdit();
        });

    const onDeleteClick =
        onDelete &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onDelete();
        });

    return (
        <div className={styles.headerActions}>
            <Tooltip title="Edit constraint" arrow>
                <IconButton
                    type="button"
                    onClick={onEditClick}
                    disabled={!Boolean(onEditClick)}
                >
                    <Edit />
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete constraint" arrow>
                <IconButton
                    type="button"
                    onClick={onDeleteClick}
                    disabled={!Boolean(onDeleteClick)}
                >
                    <Delete />
                </IconButton>
            </Tooltip>
        </div>
    );
};
