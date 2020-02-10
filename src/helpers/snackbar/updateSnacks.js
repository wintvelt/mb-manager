// updateSnacks.js
// returns new notification set

const ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR';
const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
const REMOVE_SNACKBAR = 'REMOVE_SNACKBAR';

export const enqueueSnack = notification => {
    const key = notification.options && notification.options.key;

    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            key: key || new Date().getTime() + Math.random(),
        },
    };
};

export const closeSnack = key => ({
    type: CLOSE_SNACKBAR,
    dismissAll: !key, // dismiss all if no key has been defined
    key,
});

export const removeSnackbar = key => ({
    type: REMOVE_SNACKBAR,
    key,
});

export const defaultNotifications = [];

export const updateSnacks = (notifications = defaultNotifications, action) => {
    switch (action.type) {
        case ENQUEUE_SNACKBAR: {
            const key = action.notification && action.notification.key;
            return [
                ...notifications,
                {
                    key,
                    ...action.notification,
                },
            ]
        }


        case CLOSE_SNACKBAR:
            return notifications.map(notification => (
                (action.dismissAll || notification.key === action.key)
                    ? { ...notification, dismissed: true }
                    : { ...notification }
            ));

        case REMOVE_SNACKBAR:
            return notifications.filter(
                notification => notification.key !== action.key,
            );

        default:
            return notifications;
    }
};
