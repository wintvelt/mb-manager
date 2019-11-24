// Dialog.js
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SingleSelect from './Single-Select';

export default function FormDialog(props) {
    const { onHandleClose, onChange, onSubmit, open, dialogTitle, dialogText, placeholder, label, options, selected } = props;
    const handleClose = () => {
        onHandleClose(false);
    };
    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogText}
                    </DialogContentText>
                    {options && <SingleSelect
                        options={options}
                        onChange={onChange}
                        placeholder={placeholder}
                        label={label}
                    />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Afbreken
                    </Button>
                    <Button onClick={onSubmit} color="primary" disabled={(!selected || selected.value)? false : true}>
                        Verwerken
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
