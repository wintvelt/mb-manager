// apiData.js
// the source of all the helper objects and functions
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';
import CircularProgress from '@material-ui/core/CircularProgress';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles(theme => ({
    icon: {
    },
    iconError: {
        color: orange[500],
    },
    progress: {
        margin: '2px'
    }
}));

export const LoadingIcon = (props) => {
    const { apiData, defaultIcon } = props;
    const { isLoading, hasError, hasAllData } = apiData;
    const classes = useStyles();

    return (hasError) ? <Icon className={classes.iconError}>warning</Icon>
        : (isLoading) ?
            <Fade
                in={isLoading}
                style={{
                    transitionDelay: isLoading ? '800ms' : '0ms',
                }}
                unmountOnExit
            >
                <CircularProgress className={classes.progress} disableShrink size='20px' />
            </Fade>
            : (hasAllData) ? <Icon className={classes.icon}>done</Icon>
                : <Icon>{defaultIcon}</Icon>
}

export const LoadingComp = (props) => {
    const { apiData, name = 'regels'} = props;
    const { isLoading, hasError, hasData, dataLength, loadingMsg, errorMsg, data } = apiData;
    const myText = (hasData) ?
        (dataLength) ?
            `${data.length} van ${dataLength} ${name} opgehaald`
            : (Array.isArray(data)) ?
                `${data.length} ${name} opgehaald`
                : `${name} opgehaald`
        : (hasError) ? 'Error ' + errorMsg
            : (isLoading) ? loadingMsg
                : '...'

    return (hasData && !data) ?
        <pre>{JSON.stringify(apiData, null, 2)}</pre>
        : <ListItem>
            <ListItemIcon>
                <LoadingIcon apiData={apiData} />
            </ListItemIcon>
            <ListItemText primary={myText} />
        </ListItem>
}