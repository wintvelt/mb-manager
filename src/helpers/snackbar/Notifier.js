/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withSnackbar } from 'notistack';
import { removeSnackbar, closeSnack } from './updateSnacks';
import { NOTIFY } from '../../store/action-types';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';


let displayed = [];

const storeDisplayed = (id) => {
    displayed = [...displayed, id];
};


const removeDisplayed = (id) => {
    displayed = displayed.filter(key => id !== key)
}

export const Notifier = (props) => {
    const { enqueueSnackbar, closeSnackbar } = props;

    const notifications = useSelector(store => store.notifications);
    const dispatch = useDispatch();

    useEffect(() => {
        const updateSnacks = action => dispatch({ type: NOTIFY, payload: action });
        notifications.forEach(({ key, message, hasClose, options = {}, dismissed = false }) => {
            if (dismissed) {
                closeSnackbar(key)
                return
            }
            // Do nothing if snackbar is already displayed
            if (displayed.includes(key)) return;
            // Display snackbar using notistack
            enqueueSnackbar(message, {
                key,
                ...options,
                action: hasClose ?
                    key => (
                        <Button onClick={() => updateSnacks(closeSnack(key))}><Icon>close</Icon></Button>
                    ) : null,

                onClose: (event, reason, key) => {
                    if (options.onClose) {
                        options.onClose(event, reason, key);
                    }
                },
                onExited: (event, key) => {
                    updateSnacks(removeSnackbar(key));
                    removeDisplayed(key)
                }
            });
            // Keep track of snackbars that we've displayed
            storeDisplayed(key);
        });
    }, [notifications, dispatch, closeSnackbar, enqueueSnackbar]);


    return null;
}

export default withSnackbar(Notifier);
